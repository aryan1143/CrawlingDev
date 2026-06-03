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
      skills TEXT[] DEFAULT ARRAY[]::TEXT[],
      social_links TEXT[] DEFAULT ARRAY[]::TEXT[],
      reputation INTEGER DEFAULT 0,
      badges TEXT[] DEFAULT ARRAY[]::TEXT[],
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
        description TEXT NOT NULL,
        tech_stack TEXT[] DEFAULT '{}',
        images TEXT[] DEFAULT '{}',
        github_link VARCHAR(255),
        live_link VARCHAR(255),
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
  `;

  try {
    console.log("Building database tables...");
    await pool.query(schemaQuery);
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error.message);
  }
};

export default createSchema;
