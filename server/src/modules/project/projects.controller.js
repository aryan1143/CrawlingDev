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

/**
 * like a post.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    const likeResult = await pool.query(
      `INSERT INTO post_likes (post_id, user_id)
      VALUES ($1, $2) 
      ON CONFLICT (post_id, user_id) DO NOTHING 
      RETURNING *`,
      [projectId, userId],
    );

    if (likeResult.rowCount > 0) {
      const incrementLikeResult = await pool.query(
        `UPDATE projects 
        SET likes_count = likes_count + 1 
        WHERE id = $1 
        RETURNING likes_count`,
        [projectId],
      );

      return res.status(201).json({
        success: true,
        likesCount: incrementLikeResult.rows[0].likes_count,
        isNewLike: true,
      });
    }

    return res.status(200).json({
      success: false,
      message: "Already liked",
      isNewLike: false,
    });
  } catch (error) {
    console.error("Error in likePost controller:", error);
    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};

/**
 * unlike (dislike) a post.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const dislikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    const unlikeResult = await pool.query(
      `DELETE FROM post_likes
       WHERE post_id = $1
         AND user_id = $2
       RETURNING *`,
      [projectId, userId],
    );

    if (unlikeResult.rowCount === 0) {
      return res.status(200).json({
        success: false,
        message: "Post was not liked",
        isRemoved: false,
      });
    }

    const decrementLikeResult = await pool.query(
      `UPDATE projects
       SET likes_count = GREATEST(likes_count - 1, 0)
       WHERE id = $1
       RETURNING likes_count`,
      [projectId],
    );

    return res.status(200).json({
      success: true,
      likesCount: decrementLikeResult.rows[0].likes_count,
      isRemoved: true,
    });
  } catch (error) {
    console.error("Error in dislikePost controller:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
};

/**
 * create a new review for a project.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, comment, rating } = req.body;

    if (!projectId || rating === undefined || rating === null) {
      return res.status(400).json({
        error: "Project ID and rating are required.",
        success: false,
      });
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be a number between 1 and 5.",
        success: false,
      });
    }

    if (typeof projectId !== "number" || !Number.isInteger(projectId)) {
      return res.status(400).json({
        error: "Invalid project ID provided.",
        success: false,
      });
    }

    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string") {
        return res.status(400).json({
          error: "Comment must be a string.",
          success: false,
        });
      }

      const trimmedComment = comment.trim();
      if (trimmedComment.length === 0) {
        return res.status(400).json({
          error: "Comment cannot be empty.",
          success: false,
        });
      }
    }

    const projectCheck = await pool.query(
      "SELECT id, created_by FROM projects WHERE id = $1",
      [projectId],
    );
    if (projectCheck.rowCount === 0) {
      return res.status(404).json({
        error: "Project not found.",
        success: false,
      });
    }

    const existingReview = await pool.query(
      "SELECT id FROM reviews WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );
    if (existingReview.rowCount > 0) {
      return res.status(400).json({
        error: "You have already reviewed this project.",
        success: false,
      });
    }

    const insertQuery = `
      INSERT INTO reviews (project_id, user_id, comment, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING id, project_id, user_id, comment, rating, helpful_votes, created_at
    `;
    const values = [
      projectId,
      userId,
      comment && comment.trim() !== "" ? comment.trim() : null,
      rating,
    ];

    const result = await pool.query(insertQuery, values);

    if (result.rowCount === 0) {
      return res.status(500).json({
        error: "Failed to create review.",
        success: false,
      });
    }

    const incrementReviewsResult = await pool.query(
      `WITH updated_project AS (
        UPDATE projects 
        SET reviews_count = reviews_count + 1 
        WHERE id = $1
        RETURNING reviews_count
      )
      UPDATE users 
      SET 
        average_rating = CASE 
          WHEN rating_count = 0 THEN $3::NUMERIC
          ELSE ((average_rating * rating_count) + $3::NUMERIC) / (rating_count + 1)
        END,
        rating_count = rating_count + 1 
      WHERE id = $2
`,
      [projectId, projectCheck.rows[0].created_by, rating],
    );

    const newReview = result.rows[0];

    res.status(201).json({
      review: newReview,
      reviewsCount: incrementReviewsResult?.rows[0]?.reviews_count,
      message: "Review created successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in createReview controller:", error);
    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};

/**
 * delete a review by ID.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = parseInt(req.params.id, 10);

    if (!reviewId || isNaN(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        error: "Invalid review ID provided.",
        success: false,
      });
    }

    const reviewCheck = await pool.query(
      "SELECT id, user_id, project_id FROM reviews WHERE id = $1",
      [reviewId],
    );

    if (reviewCheck.rowCount === 0) {
      return res.status(404).json({
        error: "Review not found.",
        success: false,
      });
    }

    const review = reviewCheck.rows[0];

    if (review.user_id !== userId) {
      return res.status(403).json({
        error: "You are not authorized to delete this review.",
        success: false,
      });
    }

    const deleteResult = await pool.query(
      "DELETE FROM reviews WHERE id = $1 RETURNING *",
      [reviewId],
    );

    if (deleteResult.rowCount === 0) {
      return res.status(500).json({
        error: "Failed to delete review.",
        success: false,
      });
    }

    const decrementReviewsResult = await pool.query(
      `WITH updated_project AS (
        UPDATE projects 
        SET reviews_count = reviews_count - 1 
        WHERE id = $1
        RETURNING reviews_count
      )
      UPDATE users 
      SET 
        average_rating = CASE 
          WHEN rating_count = 0 THEN 0::NUMERIC
          ELSE ((average_rating * rating_count) - $3::NUMERIC) / (rating_count - 1)
        END,
        rating_count = rating_count - 1 
      WHERE id = $2`,
      [
        reviewCheck.rows[0].project_id,
        reviewCheck.rows[0].created_by,
        deleteResult.rows[0].rating,
      ],
    );

    res.status(200).json({
      message: "Review deleted successfully.",
      success: true,
      reviewsCount: decrementReviewsResult?.rows[0]?.reviews_count,
      data: {
        reviewId: reviewId,
        projectId: review.projectId,
      },
    });
  } catch (error) {
    console.error("Error in deleteReview controller:", error);
    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};

/**
 * get reviews for a specific project.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const getProjectReviews = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    if (!projectId || isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({
        error: "Invalid project ID provided.",
        success: false,
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Limit must be between 1 and 100.",
        success: false,
      });
    }
    if (offset < 0) {
      return res.status(400).json({
        error: "Offset must be a non-negative number.",
        success: false,
      });
    }

    const projectCheck = await pool.query(
      "SELECT id, reviews_count FROM projects WHERE id = $1",
      [projectId],
    );
    if (projectCheck.rowCount === 0) {
      return res.status(404).json({
        error: "Project not found.",
        success: false,
      });
    }

    const totalReviews = parseInt(projectCheck.rows[0].reviews_count, 10);

    const query = `
      SELECT 
        r.id,
        r.project_id,
        r.user_id,
        r.comment,
        r.rating,
        r.helpful_votes,
        r.created_at,
        u.username,
        u.profile_pic
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.project_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [projectId, limit, offset]);

    const reviews = result.rows;

    res.status(200).json({
      reviews,
      pagination: {
        total: totalReviews,
        limit,
        offset,
        hasMore: offset + limit < totalReviews,
      },
      message: "Reviews fetched successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error in getProjectReviews controller:", error);
    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};
