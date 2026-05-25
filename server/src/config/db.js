import { Pool } from "pg";
import { config } from "dotenv";
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.CA_CERT.replace(/\\n/g, "\n"),
  },
});

export default pool;
