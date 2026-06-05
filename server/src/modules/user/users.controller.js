import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary.js";
import pool from "../../config/db.js";

/**
 * Handle updating the user's name.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Name is required", success: false });
    }

    const query = `UPDATE users SET name = $1 WHERE id = $2`;

    const result = await pool.query(query, [name, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res
      .status(200)
      .json({ message: "User's name updated successfully.", success: true });
  } catch (error) {
    console.log("Error in updateName users-controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle updating the user's bio.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateBio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio } = req.body;

    if (!bio) {
      return res.status(400).json({ error: "Bio is required", success: false });
    }

    const query = `UPDATE users SET bio = $1 WHERE id = $2`;

    const result = await pool.query(query, [bio, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res
      .status(200)
      .json({ message: "User's bio updated successfully.", success: true });
  } catch (error) {
    console.log("Error in updateBio controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle updating the user's skills.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body;

    if (!skills) {
      return res
        .status(400)
        .json({ error: "Skills are required", success: false });
    }

    const query = `UPDATE users SET skills = $1::text[] WHERE id = $2`;

    const result = await pool.query(query, [skills, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res
      .status(200)
      .json({ message: "User's skills updated successfully.", success: true });
  } catch (error) {
    console.log("Error in updateSkills controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Handle updating the user's social links.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const updateSocialLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { socialLinks } = req.body;

    if (!socialLinks) {
      return res
        .status(400)
        .json({ error: "Social links are required", success: false });
    }

    const query = `UPDATE users SET social_links = $1::text[] WHERE id = $2`;

    const result = await pool.query(query, [socialLinks, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User does not exist.", success: false });
    }

    res.status(200).json({
      message: "User's social links updated successfully.",
      success: true,
    });
  } catch (error) {
    console.log("Error in updateSocialLinks controller: ", error);
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
      return res
        .status(400)
        .json({
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

    const updateQuery = `UPDATE users SET profile_pic = $1 WHERE id = $2`;

    const updateResult = await pool.query(updateQuery, [newUrl, userId]);

    if (updateResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found to update profile pic." });
    }

    res
      .status(200)
      .json({
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
