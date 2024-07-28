import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  likeAndUnLikePost,
  replyPost,
  getFeedPost,
  getUserPosts,
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();
router.get("/feed", protectRoute, getFeedPost);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeAndUnLikePost);
router.put("/reply/:id", protectRoute, replyPost);

export default router;
