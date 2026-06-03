import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const middleware = Router();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 min
  limit: 100,
  message: "Too many requests, please try again later.",
  statusCode: 429,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

middleware.use(generalLimiter);

middleware.use(express.json());

middleware.use(express.urlencoded());

middleware.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

middleware.use(cookieParser());

middleware.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

export default middleware;
