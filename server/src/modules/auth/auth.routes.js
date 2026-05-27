import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from "./auth.controller.js";

/**
 * auth routes handeling
 */
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshAccessToken);
router.get("/me", getCurrentUser);

export default router;
