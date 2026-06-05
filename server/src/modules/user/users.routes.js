import { Router } from "express";
import {
  updateBadge,
  updateBio,
  updateName,
  updateReputation,
  updateSkills,
  updateSocialLinks,
  uploadProfilePic,
} from "./users.controller.js";
import { upload } from "../../config/cloudinary.js";

/**
 * User profile routes.
 */
const router = Router();

router.patch("/me/name", updateName);
router.patch("/me/bio", updateBio);
router.patch("/me/skills", updateSkills);
router.patch("/me/social-links", updateSocialLinks);
router.patch("/me/reputation", updateReputation);
router.patch("/me/badge", updateBadge);

router.put("/me/profile-pic", upload.single("image"), uploadProfilePic);

export default router;
