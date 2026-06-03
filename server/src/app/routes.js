import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import authMiddleware from "../modules/auth/auth.middleware.js";

const router = Router();

router.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running." });
});

router.use("/api/auth", authMiddleware, authRoutes);

export default router;
