import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000",
    methods: ["GET", "POST"],
  },
});
const userSocketMap = {}; //userId:socket.Id
export const getRecipientSocketId = (recipientId) => userSocketMap[recipientId];
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); ///[1,2,3]
  socket.on("markMessageAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        {
          conversationId,
          seen: false,
        },
        {
          $set: {
            seen: true,
          },
        }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messageSeen", { conversationId });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); ///[1,2,3]
  });
  socket.on("", () => {});
});
export { io, server, app };
