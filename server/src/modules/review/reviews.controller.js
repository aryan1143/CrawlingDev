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
