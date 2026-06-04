import { Router } from "express";
import rateLimit from "express-rate-limit";

const middleware = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many login attempts. Try again in 15 minutes.",
});

middleware.use("/login", authLimiter);
middleware.use("/register", authLimiter);

export default middleware;
