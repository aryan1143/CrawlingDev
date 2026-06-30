import {
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
} from "../../config/cloudinary.js";
import pool from "../../config/db.js";

/**
 * Post a project.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, techStack, github, live } = req.body;

    const values = [];

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription || !category) {
      return res.status(400).json({
        error: "Title, description, and category are required.",
        success: false,
      });
    }

    if (
      typeof cleanTitle !== "string" ||
      typeof cleanDescription !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid title or description provided.",
        success: false,
      });
    }

    values.push(cleanTitle);
    values.push(cleanDescription);

    if (typeof category !== "string") {
      return res.status(400).json({
        error: "Invalid category provided.",
        success: false,
      });
    }

    values.push(category);

    console.log(Array.isArray(techStack));
    if (
      !Array.isArray(techStack) ||
      !techStack.every((item) => typeof item === "string")
    ) {
      return res.status(400).json({
        error: "Tech stack must be an array of strings.",
        success: false,
      });
    }
    values.push(techStack || []);

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+$/i;
    const urlRegex = /^https?:\/\/.+/i;

    if (github) {
      if (typeof github !== "string" || !githubRegex.test(github)) {
        return res.status(400).json({
          error: "Invalid github link provided.",
          success: false,
        });
      }
    }
    values.push(github || null);

    if (live) {
      if (typeof live !== "string" || !urlRegex.test(live)) {
        return res.status(400).json({
          error: "Invalid live link provided.",
          success: false,
        });
      }
    }
    values.push(live || null);

    if (!req.files || req.files.length === 0)
      return res
        .status(400)
        .json({ error: "No project image provided", success: false });

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userResult.rowCount === 0)
      return res.status(404).json({ error: "User not found", success: false });

    const imageUrls = await uploadMultipleToCloudinary(
      req?.files,
      `projects/${userId}`,
    );

    values.push(imageUrls);
    values.push(userId);

    const query = `INSERT INTO projects (title, description, category, tech_stack, github_link, live_link, images, created_by) VALUES ($1, $2, $3, $4::text[], $5, $6, $7::text[], $8) RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Failed to create post.", success: false });
    }

    const project = result.rows[0];

    res.status(201).json({
      project: project,
      message: "Post created successfully.",
      success: true,
    });
  } catch (error) {
    console.log("Error in createProject controller: ", error);
    return res
      .status(500)
      .json({ error: "Internal server error.", success: false });
  }
};

/**
 * Delete a post (project).
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        error: "Project ID is required.",
        success: false,
      });
    }

    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId],
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({
        error: "Project not found.",
        success: false,
      });
    }

    const project = projectResult.rows[0];

    if (project.created_by !== userId) {
      return res.status(403).json({
        error: "You are not authorized to delete this project.",
        success: false,
      });
    }

    if (project.images?.length) {
      await Promise.all(
        project.images.map((imageUrl) => deleteFromCloudinary(imageUrl)),
      );
    }

    const deleteResult = await pool.query(
      "DELETE FROM projects WHERE id = $1 RETURNING *",
      [projectId],
    );

    res.status(200).json({
      project: deleteResult.rows[0],
      message: "Project deleted successfully.",
      success: true,
    });
  } catch (error) {
    console.log("Error in deleteProject controller:", error);

    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};

/**
 * Gets all of the projects created by the user.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM projects
       WHERE created_by = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return res.status(200).json({
      projects: result.rows,
      count: result.rowCount,
      success: true,
    });
  } catch (error) {
    console.error("Error in getMyProjects controller:", error);

    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};
