import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../../shared/jwt.js";

/**
 * Register a new user.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ error: "Name, username and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters.",
    });
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();
    //query to check if the user with the username already exist
    const isAlreadyExistQuery = `SELECT * FROM users WHERE username = $1`;

    const isAlreadyExistResult = await pool.query(isAlreadyExistQuery, [
      normalizedUsername,
    ]);

    if (isAlreadyExistResult.rowCount !== 0) {
      return res
        .status(400)
        .json({ error: "User with this username already exist" });
    }

    //query to create user in the database
    const query = `
    INSERT INTO users (name, username, password) 
    VALUES ($1, $2, $3) 
    RETURNING *;
    `;

    //hashing the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(query, [
      name,
      normalizedUsername,
      hashedPassword,
    ]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Failed to register user" });
    }

    const user = result.rows[0];
    delete user.password;

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    //setting token to cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000, // expires in 15 mins (in milliseconds)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // expires in 7 days (in milliseconds)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(201).json({
      user,
      message: "User registered successfully.",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in register controller: ", error);
  }
};

/**
 * Authenticate an existing user.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();
    //query to check if the user with the username exist
    const query = `
      SELECT *
      FROM users
      WHERE username = $1
      `;

    const result = await pool.query(query, [normalizedUsername]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return res.status(400).json({ error: "Invalid username or password." });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    //setting token to cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000, // expires in 15 mins (in milliseconds)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // expires in 7 days (in milliseconds)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    delete user.password;

    res.status(200).json({
      user,
      message: "User logged in successfully.",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in login controller: ", error);
  }
};

/**
 * End the current user session (logout the user).
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const logout = (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in logout controller: ", error);
  }
};

/**
 * Refresh the access token which is expired.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized! No token provided." });
  }

  try {
    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const query = `SELECT id FROM users WHERE id = $1`;

    const userData = await pool.query(query, [decodedRefresh.id]);

    if (userData.rowCount === 0) {
      return res.status(401).json({ error: "User no longer exist" });
    }

    const user = userData.rows[0];

    const newAccessToken = signAccessToken(user.id);

    res.cookie("accessToken", newAccessToken, {
      maxAge: 15 * 60 * 1000, // expires in 15 minutes (in milliseconds)
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refreshed successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in refresh-access-token controller: ", error);
  }
};

/**
 * Return the authenticated user's profile.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const getCurrentUser = async (req, res) => {
  const userId = req.user.id;

  try {
    //query to check if the user with the userId exist.
    const query = `SELECT * FROM users WHERE id = $1`;

    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const user = result.rows[0];
    delete user.password;

    res.status(200).json({ user, message: "User data fetched successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in get-current-user controller: ", error);
  }
};
