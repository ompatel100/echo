import express from "express";
const router = express.Router();
import {
  createTag,
  getSingleTag,
  getAllTags,
  updateTag,
  deleteTag,
} from "../controllers/tagControllers.js";
import { adminGuard, authGuard } from "../middleware/authMiddleware.js";

router.route("/").get(getAllTags).post(authGuard, adminGuard, createTag);

router
  .route("/:tagId")
  .get(getSingleTag)
  .put(authGuard, adminGuard, updateTag)
  .delete(authGuard, adminGuard, deleteTag);

export default router;
