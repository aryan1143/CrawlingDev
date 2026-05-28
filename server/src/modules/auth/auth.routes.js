import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from "./auth.controller.js";
import { requireAuth } from "../../shared/jwt.js";

/**
 * auth routes handeling
 */
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refreshAccessToken);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentUser);

export default router;
