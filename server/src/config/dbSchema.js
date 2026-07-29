import pool from "./db.js";

const createSchema = async () => {
  const schemaQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      bio TEXT,
      profile_pic TEXT DEFAULT 'https://res.cloudinary.com/dujfvcxjl/image/upload/v1776753314/defaultpfp.png',
      banner TEXT DEFAULT 'default-banner',
      skills TEXT[] DEFAULT ARRAY[]::TEXT[],
      github VARCHAR(100),
      linkedin VARCHAR(100),
      reputation INTEGER DEFAULT 0,
      badges TEXT[] DEFAULT ARRAY[]::TEXT[],
      average_rating NUMERIC(3, 2) CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
      rating_count INTEGER DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS followers (
      follower_id INTEGER REFERENCES users(id),
      following_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        tech_stack TEXT[] DEFAULT '{}',
        images TEXT[] DEFAULT '{}',
        github_link VARCHAR(255),
        live_link VARCHAR(255),
        likes_count INT DEFAULT 0 NOT NULL,
        reviews_count INT DEFAULT 0 NOT NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        helpful_votes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      post_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id) 
    );
  `;

  try {
    console.log("Building database tables...");
    await pool.query(schemaQuery);
    console.log("Tables created/verified successfully!");
  } catch (error) {
    console.error("Error creating tables:", error.message);
  }
};

export default createSchema;
