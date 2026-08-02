import pool from "../../config/db.js";

/**
 * post a review.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, comment, rating } = req.body;

    if (!projectId) {
      return res.status(400).json({
        error: "Project ID is required.",
        success: false,
      });
    }

    if (!rating || Number.isNaN(Number(rating))) {
      return res.status(400).json({
        error: "Rating is required.",
        success: false,
      });
    }

    const normalizedRating = Number(rating);

    if (normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5.",
        success: false,
      });
    }

    if (comment && typeof comment !== "string") {
      return res.status(400).json({
        error: "Comment must be a string.",
        success: false,
      });
    }

    const projectResult = await pool.query(
      "SELECT id FROM projects WHERE id = $1",
      [projectId],
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({
        error: "Project not found.",
        success: false,
      });
    }

    const duplicateReview = await pool.query(
      "SELECT id FROM reviews WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );

    if (duplicateReview.rowCount > 0) {
      return res.status(409).json({
        error: "You have already reviewed this project.",
        success: false,
      });
    }

    const result = await pool.query(
      `INSERT INTO reviews (project_id, user_id, comment, rating)
			 VALUES ($1, $2, $3, $4)
			 RETURNING *`,
      [projectId, userId, comment?.trim() || null, normalizedRating],
    );

    return res.status(201).json({
      review: result.rows[0],
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
 * get all reviews created by the user.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const getAllMyreview = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT reviews.*, projects.title AS project_title, projects.category, projects.images
			 FROM reviews
			 JOIN projects ON projects.id = reviews.project_id
			 WHERE reviews.user_id = $1
			 ORDER BY reviews.created_at DESC`,
      [userId],
    );

    return res.status(200).json({
      reviews: result.rows,
      count: result.rowCount,
      success: true,
    });
  } catch (error) {
    console.error("Error in getAllMyreview controller:", error);

    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};

/**
 * delete a review created by the user.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        error: "Review ID is required.",
        success: false,
      });
    }

    const reviewResult = await pool.query(
      "SELECT * FROM reviews WHERE id = $1",
      [reviewId],
    );

    if (reviewResult.rowCount === 0) {
      return res.status(404).json({
        error: "Review not found.",
        success: false,
      });
    }

    const review = reviewResult.rows[0];

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

    return res.status(200).json({
      review: deleteResult.rows[0],
      message: "Review deleted successfully.",
      success: true,
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
 * get received reviews for a specific user with flexible ordering and pagination.
 * @param req - Express request object
 * @param res - Express response object
 */
export const getReceivedReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = req.query.order || "recent";
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const validOrders = ["recent", "oldest", "top", "least"];
    if (!validOrders.includes(order)) {
      return res.status(400).json({
        error: "Invalid order value. Allowed: recent, oldest, top, least",
        success: false,
      });
    }

    let orderByClause;
    switch (order) {
      case "recent":
        orderByClause = "r.created_at DESC";
        break;
      case "oldest":
        orderByClause = "r.created_at ASC";
        break;
      case "top":
        orderByClause = "r.rating DESC NULLS LAST";
        break;
      case "least":
        orderByClause = "r.rating ASC NULLS LAST";
        break;
      default:
        orderByClause = "r.created_at DESC";
    }

    const queryText = `
      SELECT 
        r.id AS review_id,
        r.comment,
        r.rating,
        r.helpful_votes,
        r.created_at AS review_created_at,
        p.id AS project_id,
        p.title AS project_title,
        p.images AS project_images,
        u.id AS reviewer_id,
        u.name AS reviewer_name,
        u.username AS reviewer_username,
        u.profile_pic AS reviewer_profile_pic
      FROM reviews r
      JOIN projects p ON r.project_id = p.id
      JOIN users u ON r.user_id = u.id
      WHERE p.created_by = $1
      ORDER BY ${orderByClause}
      LIMIT $2 OFFSET $3
    `;

    const values = [userId, limit, offset];
    const result = await pool.query(queryText, values);

    const countQuery = `
      SELECT COUNT(*) 
      FROM reviews r
      JOIN projects p ON r.project_id = p.id
      WHERE p.created_by = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      reviews: result.rows,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + result.rows.length < totalCount,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in getReceivedReviews controller:", error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};
