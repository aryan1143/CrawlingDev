import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = Router();

router.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running." });
});

router.use("/api/auth", authRoutes);

export default router;
