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
				p.likes_count,
				p.reviews_count,
				u.id AS author_id,
				u.name AS author_name,
				u.username AS author_username,
				u.profile_pic AS author_profile_pic,
				u.reputation AS author_reputation,
				u.bio AS author_bio,
				EXISTS (
					SELECT 1 FROM post_likes l 
					WHERE l.post_id = p.id 
					AND l.user_id = $1
				) AS is_liked
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

/**
 * Search projects by matching query words across their searchable fields.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const searchProjects = async (req, res) => {
  try {
    const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    if (!search) {
      return res.status(400).json({
        error: "A search query is required.",
        success: false,
      });
    }

    const searchableText = `concat_ws(
			' ',
			p.title,
			p.description,
			p.category,
			array_to_string(p.tech_stack, ' ')
		)`;

    const searchQuery = `
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
				p.likes_count,
				p.reviews_count,
				u.id AS author_id,
				u.name AS author_name,
				u.username AS author_username,
				u.profile_pic AS author_profile_pic,
				u.reputation AS author_reputation,
				u.bio AS author_bio,
				EXISTS (
					SELECT 1 FROM post_likes l
					WHERE l.post_id = p.id AND l.user_id = $4
				) AS is_liked,
				matches.match_count
			FROM projects p
			INNER JOIN users u ON u.id = p.created_by
			CROSS JOIN LATERAL (
				SELECT COUNT(*)::int AS match_count
				FROM regexp_split_to_table(trim($1), '\\s+') AS term
				WHERE regexp_replace(lower(term), '[^[:alnum:]_]+', '', 'g') <> ''
					AND ${searchableText} ILIKE '%' || regexp_replace(lower(term), '[^[:alnum:]_]+', '', 'g') || '%'
			) matches
			WHERE matches.match_count > 0
			ORDER BY matches.match_count DESC, p.created_at DESC, p.id DESC
			LIMIT $2 OFFSET $3
		`;

    const countQuery = `
			SELECT COUNT(*)::int AS total
			FROM projects p
			CROSS JOIN LATERAL (
				SELECT COUNT(*) AS match_count
				FROM regexp_split_to_table(trim($1), '\\s+') AS term
				WHERE regexp_replace(lower(term), '[^[:alnum:]_]+', '', 'g') <> ''
					AND ${searchableText} ILIKE '%' || regexp_replace(lower(term), '[^[:alnum:]_]+', '', 'g') || '%'
			) matches
			WHERE matches.match_count > 0
		`;

    const [searchResult, countResult] = await Promise.all([
      pool.query(searchQuery, [search, limit, offset, userId]),
      pool.query(countQuery, [search]),
    ]);

    const total = countResult.rows[0]?.total || 0;

    return res.status(200).json({
      projects: searchResult.rows,
      page,
      limit,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + searchResult.rows.length < total,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in searchProjects controller:", error);

    return res.status(500).json({
      error: "Internal server error.",
      success: false,
    });
  }
};
