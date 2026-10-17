import { Router } from "express";
import { getFeed, searchProjects } from "./feed.controller.js";

/**
 * feed routes.
 */
const router = Router();

router.get("/search", searchProjects);
router.get("/", getFeed);

export default router;
