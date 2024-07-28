import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;
    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "Please provide both postedBy and text. | required" });
    }
    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(500).json({ error: "Unauthorized to create a post." });
    }
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text should not exceed ${maxLength} characters.` });
    }
    if (img) {
      const updatedResponse = await cloudinary.uploader.upload(img);
      img = updatedResponse.secure_url;
    }
    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    return res.status(200).json(newPost);
  } catch (e) {
    return res.status(400).json({ error: "error created controllers: ", e });
  }
};
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post params id Not Found" });
    }
    return res.status(200).json(post);
  } catch (e) {
    return res.status(400).json({ error: "error getting controllers: ", e });
  }
};
const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ error: "Post id params not found" });
  }
  if (post.postedBy.toString() !== req.user._id.toString()) {
    return res.status(404).json({ error: "Unauthorized to delete" });
  }
  if (post.img) {
    const imgId = post.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  }

  await Post.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Post deleted successfully" });
};
const likeAndUnLikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    const userLikePost = post.likes.includes(userId);
    if (userLikePost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "unliked successfully." });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "liked successfully." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "like and unlike post error||", err });
  }
};
const replyPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    console.log(req.user);
    const username = req.user.username;
    if (!text) {
      return res.status(400).json({ error: "Reply text is required." });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    const reply = {
      userId,
      text,
      userProfilePic,
      username,
    };
    post.replies.push(reply);
    await post.save();
    return res.status(200).json(reply);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getFeedPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const following = user.following;

    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    return res.status(200).json(feedPosts);
  } catch (err) {
    console.error("Error in get feed post", err.message);
    return res.status(500).json({ error: "Error in get feed post", err });
  }
};
const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export {
  createPost,
  getPost,
  deletePost,
  likeAndUnLikePost,
  replyPost,
  getFeedPost,
  getUserPosts,
};
