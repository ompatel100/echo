import express from "express";
const router = express.Router();
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
  updatePostPhoto,
} from "../controllers/postControllers.js";
import { authGuard } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadPictureMiddleware.js";

router
  .route("/")
  .post(authGuard, upload.single("postPicture"), createPost)
  .get(getAllPosts);

router
  .route("/:postId")
  .patch(authGuard, updatePost)
  .delete(authGuard, deletePost)
  .get(getPost);

router
  .route("/:postId/postPicture")
  .put(authGuard, upload.single("postPicture"), updatePostPhoto);
export default router;
