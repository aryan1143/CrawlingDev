import { Router } from "express";
import { getFeed } from "./feed.controller.js";

/**
 * feed routes.
 */
const router = Router();

router.get("/", getFeed);

export default router;
