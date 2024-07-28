import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import { app, server } from "./socket/socket.js";
import path from "path";
dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//middleware
app.use(express.json({ limit: "50mb" })); //to parser json data in the req.body
app.use(express.urlencoded({ extended: true })); // to parser form data in the req.body
app.use(cookieParser());
//routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/messages", messageRoutes);
///http://localhost:5000 backend,frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}
server.listen(PORT, () =>
  console.log(`listening on port localhost:${PORT} hey`)
);
