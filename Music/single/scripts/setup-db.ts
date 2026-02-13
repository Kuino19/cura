import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL is missing");
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

async function main() {
  console.log("Dropping existing tables...");
  await client.execute("DROP TABLE IF EXISTS Match");
  await client.execute("DROP TABLE IF EXISTS Answer");
  await client.execute("DROP TABLE IF EXISTS User");
  await client.execute("DROP TABLE IF EXISTS Question");

  console.log("Setting up database schema...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      phoneNumber TEXT UNIQUE NOT NULL,
      name TEXT,
      gender TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS Question (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS Answer (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      questionId TEXT NOT NULL,
      myAttribute TEXT NOT NULL,
      desiredAttribute TEXT NOT NULL,
      importance TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES User(id),
      FOREIGN KEY (questionId) REFERENCES Question(id),
      UNIQUE(userId, questionId)
    );
  `);

  // Matches table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS Match (
      id TEXT PRIMARY KEY,
      userAId TEXT NOT NULL,
      userBId TEXT NOT NULL,
      score REAL NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userAId) REFERENCES User(id),
      FOREIGN KEY (userBId) REFERENCES User(id),
      UNIQUE(userAId, userBId)
    );
  `);

  console.log("Schema setup complete.");
}

main().catch(console.error);
