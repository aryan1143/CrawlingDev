import pool from "../../config/db.js";

/**
 * Get the authenticated user's feed.
 *
 * The feed contains projects created by users the current user follows,
 * excluding their own projects.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const offset = (page - 1) * limit;

    const feedQuery = `
			SELECT
				p.id,
				p.title,
				p.description,
				p.category,
				p.tech_stack,
				p.images,
				p.github_link,
				p.live_link,
				p.created_at,
				u.id AS author_id,
				u.name AS author_name,
				u.username AS author_username,
				u.profile_pic AS author_profile_pic,
				u.reputation AS author_reputation
			FROM projects p
			INNER JOIN users u ON u.id = p.created_by
			WHERE p.created_by <> $1
			ORDER BY p.created_at DESC
			LIMIT $2 OFFSET $3
		`;

    const countQuery = `
			SELECT COUNT(*)::int AS total
			FROM projects p
			WHERE p.created_by <> $1
		`;

    const [feedResult, countResult] = await Promise.all([
      pool.query(feedQuery, [userId, limit, offset]),
      pool.query(countQuery, [userId]),
    ]);

    return res.status(200).json({
      feed: feedResult.rows,
      page,
      limit,
      total: countResult.rows[0]?.total || 0,
      success: true,
    });
  } catch (error) {
    console.error("Error in getFeed controller:", error);

    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};
