import { Router } from "express";
import { createProject, deleteProject } from "./projects.controller.js";
import { requireAuth } from "../../shared/jwt.js";
import { upload } from "../../config/cloudinary.js";

/**
 * project routes handeling
 */
const router = Router();

router.post("/", upload.array("images", 3), createProject);
router.delete("/:projectId", deleteProject);

export default router;
