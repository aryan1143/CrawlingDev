import {
  deleteFolderEntirelyFromCloudinary,
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary.js";
import pool from "../../config/db.js";

/**
 * Handle updating the user's profile details in one request.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, skills, github, linkedin } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          error: "Name must be a non-empty string",
          success: false,
        });
      }

      values.push(name.trim());
      updates.push(`name = $${values.length}`);
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res
          .status(400)
          .json({ error: "Bio must be a string", success: false });
      }

      values.push(bio);
      updates.push(`bio = $${values.length}`);
    }

    if (skills !== undefined) {
      if (
        !Array.isArray(skills) ||
        !skills.every((skill) => typeof skill === "string")
      ) {
        return res.status(400).json({
          error: "Skills must be an array of strings",
          success: false,
        });
      }

      values.push(skills);
      updates.push(`skills = $${values.length}::text[]`);
    }

    if (github !== undefined) {
      if (typeof github !== "string") {
        return res
          .status(400)
          .json({ error: "Github link must be a string", success: false });
      }

      values.push(github);
      updates.push(`github = $${values.length}`);
    }

    if (linkedin !== undefined) {
      if (typeof linkedin !== "string") {
        return res
          .status(400)
          .json({ error: "Linkedin link must be a string", success: false });
      }

      values.push(linkedin);
      updates.push(`linkedin = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "At least one profile field is required to update",
        success: false,
      });
    }

    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${values.length}
      RETURNING id, name, username, bio, profile_pic, banner, skills, linkedin, github, reputation, badges, created_at
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res.status(200).json({
      message: "User profile updated successfully.",
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.log("Error in updateProfile controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle updating the user's reputation.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateReputation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reputation } = req.body;

    if (
      reputation === undefined ||
      reputation === null ||
      typeof reputation !== "number" ||
      Number.isNaN(reputation)
    ) {
      return res.status(400).json({
        error: "Reputation is required and must be a number",
        success: false,
      });
    }

    const query = `UPDATE users SET reputation = $1 WHERE id = $2`;

    const result = await pool.query(query, [reputation, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res.status(200).json({
      message: "User's reputation updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log("Error in updateReputation controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle updating the user's badges.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateBadge = async (req, res) => {
  try {
    const userId = req.user.id;
    const { badge } = req.body;

    if (!badge) {
      return res
        .status(400)
        .json({ error: "Badge are required", success: false });
    }

    if (typeof badge !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid type of badge data", success: false });
    }

    const query = `UPDATE users SET badges = array_append(badge, $1) WHERE id = $2`;

    const result = await pool.query(query, [badge, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res
      .status(200)
      .json({ message: "User's badge updated successfully.", success: true });
  } catch (error) {
    console.log("Error in updateBadge controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle uploading the user's profile picture.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file || !req.file.buffer)
      return res
        .status(400)
        .json({ error: "No image provided", success: false });

    const result = await pool.query(
      "SELECT profile_pic FROM users WHERE id = $1",
      [userId],
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "User not found", success: false });

    const newUrl = await uploadToCloudinary(
      req.file.buffer,
      `profiles/${userId}`,
    );

    const updateQuery = `UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING profile_pic`;

    const updatedResult = await pool.query(updateQuery, [newUrl, userId]);

    if (updatedResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found to update profile pic." });
    }

    res.status(200).json({
      profile_pic: updatedResult.rows[0].profile_pic,
      message: "User profile pic updated successfully.",
      success: true,
    });

    const user = result.rows[0];

    if (
      user.profile_pic !==
      "https://res.cloudinary.com/dujfvcxjl/image/upload/v1776753314/defaultpfp.png"
    ) {
      try {
        await deleteFromCloudinary(user.profile_pic);
      } catch (error) {
        console.log(
          "Error during deleting old profile_pic of user in update profile pic controller: ",
          error,
        );
      }
    }
  } catch (error) {
    console.log("Error in  controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle uploading the user's banner picture.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateBanner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bannerId } = req.body;

    if (!bannerId) {
      return res
        .status(400)
        .json({ error: "Banner id id required", success: false });
    }

    if (typeof bannerId !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid type banner id", success: false });
    }

    const query = `UPDATE users SET banner = $1 WHERE id = $2`;

    const result = await pool.query(query, [bannerId, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res
      .status(200)
      .json({ message: "User's banner updated successfully.", success: true });
  } catch (error) {
    console.log("Error in updateBanner controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Delete the user account.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `DELETE FROM users WHERE id = $1;`;

    const result = await pool.query(query, [userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res.clearCookie("refreshToken");

    res
      .status(200)
      .json({ message: "User's account deleted successfully.", success: true });

    await deleteFolderEntirelyFromCloudinary(`profiles/${userId}`);
    await deleteFolderEntirelyFromCloudinary(`projects/${userId}`);
  } catch (error) {
    console.log("Error in deleteAccount controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};
