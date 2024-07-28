import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user._id;
    let { img } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        messages: [{ senderId, message }],
      });
      await conversation.save();
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newMesage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
    });
    await Promise.all([
      newMesage.save(),
      conversation.updateOne({
        $set: {
          lastMessage: {
            text: message,
            sender: senderId,
            seen: false,
          },
        },
      }),
    ]);
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMesage);
    }
    res.status(200).json(newMesage);
  } catch (e) {
    return res.status(500).json("error", e.message);
  }
}

const getMessage = async (req, res) => {
  const { otherUserId } = req.params;
  const senderId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, otherUserId] },
    });
    if (!conversation) {
      return res.status(404).json({ error: "No conversation found." });
    }
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getConversations = async (req, res) => {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({ path: "participants", select: "username profilePic" });
    // remove the current user from the participants list
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (p) => p._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export { sendMessage, getMessage, getConversations };
