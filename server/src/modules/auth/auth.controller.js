import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "../../shared/jwt.js";

/**
 * Register a new user.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns {void}
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email and password are required." });
  }

  try {
    //query to check if the user with the email already exist
    const isAlreadyExistQuery = `SELECT * FROM users WHERE email = $1`;

    const isAlreadyExistResult = await pool.query(isAlreadyExistQuery, [email]);

    if (isAlreadyExistResult.rowCount !== 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exist" });
    }

    //query to create user in the database
    const query = `
    INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3) 
    RETURNING id, name, username, bio, skills, followers, reputation, badges, created_at;
    `;

    //hashing the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(query, [name, email, hashedPassword]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Failed to register user" });
    }

    const user = result.rows[0];

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    //setting token to cookie
    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000, // expires in 15 mins (in milliseconds)
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // expires in 7 days (in milliseconds)
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(201).json({ user, message: "User registerd succesfully." });
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
 * @returns {void}
 */
export const login = (req, res) => {
  res.status(501).json({
    message: "Login handler not implemented yet.",
  });
};

/**
 * End the current user session.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns {void}
 */
export const logout = (req, res) => {
  res.status(501).json({
    message: "Logout handler not implemented yet.",
  });
};

/**
 * Refresh the access token which is expired.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns {void}
 */
export const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if(!refreshToken) {
    return res.status(401).json({error: "Unauthorized! No token provided."});
  }

  try {
    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const query = `SELECT id FROM users WHERE id = $1`;

    const userData = await pool.query(query, [decodedRefresh.id]);

    if (userData.rowCount === 0) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    const user = userData.rows[0];

    const newAccessToken = signAccessToken(user.id);

    res.cookie("accessToken", newAccessToken, {
      maxAge: 15 * 60 * 1000, // expires in 15 minutes (in milliseconds)
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({message: "Token refreshed successfully."});

  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
    console.log("Error in register controller: ", error);
  }

};

/**
 * Return the authenticated user's profile.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @returns {void}
 */
export const getCurrentUser = (req, res) => {
  res.status(501).json({
    message: "Current user handler not implemented yet.",
  });
};
