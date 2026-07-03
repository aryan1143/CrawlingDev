import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import authMiddleware from "../modules/auth/auth.middleware.js";
import usersRoutes from "../modules/user/users.routes.js";
import projectRoutes from "../modules/project/projects.routes.js";
import feedRoutes from "../modules/feed/feed.routes.js";
import reviewRoutes from "../modules/review/reviews.routes.js";
import { requireAuth } from "../shared/jwt.js";

/**
 * app /api routes handeling
 */
const router = Router();

router.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running." });
});

router.use("/api/auth", authMiddleware, authRoutes);

router.use("/api/users", requireAuth, usersRoutes);

router.use("/api/projects", requireAuth, projectRoutes);

router.use("/api/feed", requireAuth, feedRoutes);

router.use("/api/reviews", requireAuth, reviewRoutes);

export default router;
