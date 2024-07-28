import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/postModel.js";
import generateTokenAndSetCookie from "../helpers/generate.js";

const getUserProfile = async (req, res) => {
  const { query } = req.params;
  //we will fetch user profile either with username or userID
  //query is either username or userID

  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findById({ _id: query })
        .select("-password")
        .select("-updateAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updateAt");
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const signupUser = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      return res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user && !isPasswordCorrect)
      return res.status(400).json({ error: "invalid username or password" });
    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }
    console.log("heheheh", user);
    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const followAndUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow or unfollow yourself" });
    } else {
      if (!userToModify || !currentUser)
        return res.json({ error: "user not found" });
      const isFollowing = currentUser.following.includes(id);
      if (isFollowing) {
        //unfollow user

        await User.findByIdAndUpdate(req.user._id, {
          $pull: { following: id }, //userToModify {req.user._id of req after verify jwt protectRoute.js }
        });

        await User.findByIdAndUpdate(id, {
          $pull: { followers: req.user._id }, //currentUser {id of params}
        });

        return res.json({ message: "User has been unfollowed" });
      } else {
        //folow user
        await User.findByIdAndUpdate(req.user._id, {
          $push: { following: id },
        });
        await User.findByIdAndUpdate(id, {
          $push: { followers: req.user._id },
        });
        return res.json({ message: "User has been followed" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// UPDATE USER
const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findByIdAndUpdate(userId);
    if (!userId) {
      return res.status(401).json({ error: "user not found" });
    }
    if (req.params.id !== userId.toString()) {
      return res
        .status(401)
        .json({ error: "you cannot update other user's profile" });
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(userId, {
        password: hashedPassword,
      });
    }
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const updatedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = updatedResponse.secure_url;
    }
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;
    user = await user.save();
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );
    user.password = null;
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};
const getSuggestedUsers = async (req, res) => {
  try {
    //exclude the current user from suggested users list,
    // exclude user that current user is already following
    const userId = req.user._id;
    const usersFollowedByYou = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 5);
    //reset password request = null to client
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isFrozen = true;
    await user.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
export {
  getUserProfile,
  signupUser,
  loginUser,
  logoutUser,
  followAndUnFollowUser,
  updateUser,
  getSuggestedUsers,
  freezeAccount,
};
