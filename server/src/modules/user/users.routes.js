import { Router } from "express";
import {
  updateBadge,
  updateProfile,
  updateReputation,
  uploadProfilePic,
} from "./users.controller.js";
import { upload } from "../../config/cloudinary.js";

/**
 * User profile routes.
 */
const router = Router();

router.patch("/me", updateProfile);

router.patch("/me/reputation", updateReputation);

router.patch("/me/badge", updateBadge);

router.put("/me/profile-pic", upload.single("image"), uploadProfilePic);

export default router;
