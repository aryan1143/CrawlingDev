import app from "./app/app.js";
import pool from "./config/db.js";
import createSchema from "./config/dbSchema.js";
import "dotenv/config";

const PORT = Number(process.env.PORT) || 3100;

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Successfully securely connected to PostgreSQL!");
    release();
  }
});

createSchema();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
