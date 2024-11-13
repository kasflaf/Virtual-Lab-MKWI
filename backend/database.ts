import { open } from "sqlite"; // Import the 'open' function from 'sqlite'
import sqlite3 from "sqlite3"; // Import sqlite3 as the database driver

const initDb = async () => {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);

  return db;
};

export default initDb;
