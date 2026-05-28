import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/**
 * Create a short-lived access token for a user.
 *
 * @param id - The user id to include in the token payload.
 * @returns Signed JWT access token (expires in 15 minutes).
 */
export function signAccessToken(id) {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

/**
 * Create a long-lived refresh token for a user.
 *
 * @param id - The user id to include in the token payload.
 * @returns  Signed JWT refresh token (expires in 7 days).
 */
export function signRefreshToken(id) {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * middleware that enforces authentication.
 *
 * It checks for the refresh token (`refreshToken`) in
 * cookies. If the access token is valid the middleware attaches `req.user` and
 * calls `next()`. If the access token is expired send res with 401 status code.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next middleware.
 * @returns Resolves when middleware completes (calls next or sends a response).
 */
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. No token provided." });
  }

  const accessToken = authHeader.split(" ")[1];
  const refreshToken = req.cookie?.refreshToken;
  if (!accessToken || !refreshToken) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Unauthorized! Expired access token." });
    }
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in require-auth middleware: ", error);
  }

  req.user = user;
  next();
};
