import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAllMyreview,
} from "./reviews.controller.js";
import { requireAuth } from "../../shared/jwt.js";

/**
 * review routes handeling
 */
const router = Router();

router.post("/", createReview);
router.get("/me", getAllMyreview);
router.delete("/:reviewId", deleteReview);

export default router;
