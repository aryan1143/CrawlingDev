import { Router } from "express";
import {
  createProject,
  createReview,
  deleteProject,
  deleteReview,
  dislikePost,
  getMyProjects,
  getProjectReviews,
  likePost,
} from "./projects.controller.js";
import { requireAuth } from "../../shared/jwt.js";
import { upload } from "../../config/cloudinary.js";

/**
 * project routes handeling
 */
const router = Router();

router.post("/", upload.array("images", 3), createProject);
router.get("/me", getMyProjects);
router.delete("/:projectId", deleteProject);

router.post("/like/:projectId", likePost);
router.delete("/like/:projectId", dislikePost);

router.post("/reviews", createReview);
router.delete("/reviews/:id", deleteReview);
router.get("/reviews/:projectId", getProjectReviews);

export default router;
