import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const middleware = Router();

middleware.use(express.json());

middleware.use(express.urlencoded());

middleware.use(cors());

middleware.use(cookieParser());

middleware.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

export default middleware;
