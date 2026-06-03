import { Router } from "express";
import rateLimit from "express-rate-limit";

const middleware = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many login attempts. Try again in 15 minutes.",
});

middleware.use(loginLimiter);

export default middleware;
