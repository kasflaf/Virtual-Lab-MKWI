/// <reference path="../express.d.ts" />
// @deno-types="npm:@types/express@4.17.15"
import express, { NextFunction, Request, Response } from "express";
import initDb from "./database.ts";
import bcrypt from "bcrypt";
import process from "process";
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import cors from "cors";
import cookieParser from "cookie-parser";

interface JwtPayload {
  id: number;
  username: string;
}

//enviroment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const FRONTEND_URL = process.env.FRONTEND_URL || ["http://localhost", "http://128.199.65.6"];
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || false;

// Generate a key using the Web Crypto API
async function generateKey(secret: string) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  return await crypto.subtle.importKey(
    "raw", // raw format
    keyData, // secret key
    { name: "HMAC", hash: "SHA-256" }, // Algorithm used for signing
    false, // Whether the key is extractable
    ["sign", "verify"], // Key usage
  );
}

//initialize database
const db = await initDb();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions)); //CORS
app.use(express.json()); //json parsing
app.use(cookieParser()); //cookie parser

const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from cookies instead of Authorization header
    const token = req.cookies.jwt;

    if (!token) {
      console.log("Token is missing.");
      return res.status(401).send("Authentication required");
    }

    console.log("Extracted token:", token);

    const key = await generateKey(JWT_SECRET);
    const decoded = await verify(token, key);

    console.log("Decoded token:", decoded);

    const decodedPayload = decoded as unknown as JwtPayload;
    req.user = {
      id: decodedPayload.id,
      username: decodedPayload.username,
    };

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).send("Invalid or expired token");
  }
};

// Register endpoint
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use db.prepare() and await the run() to insert the user into the database
    const stmt = await db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)",
    );
    await stmt.run(username, hashedPassword);
    await stmt.finalize(); // Ensure the statement is finalized

    return res.status(200).json({ message: "Registered successfully" });
  } catch (err) {
    if (err instanceof Error) {
      // Check for UNIQUE constraint violation
      if (err.message.includes("UNIQUE constraint")) {
        return res.status(400).json({ error: "Username already exists" });
      }
      return res.status(500).json({ error: "Error creating user" });
    }
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Look for user in database
  const user = await db.get("SELECT * FROM users WHERE username = ?", username);

  if (!user) {
    return res.status(401).json({ error: "Invalid username" });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid password" });
  }

  // Generate a key for signing JWTs
  const key = await generateKey(JWT_SECRET);

  // Define JWT payload and expiration time
  const payload = { id: user.id };
  const exp = getNumericDate(60 * 60); // 1 hour from now

  try {
    // Generate JWT using the key and payload
    const token = await create(
      { alg: "HS256", typ: "JWT" }, // Header
      { ...payload, exp }, // Payload
      key, // Key
    );

    // Set the token as an HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JavaScript access to cookie
      secure: true, // Only use secure in production
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 86400000, // 1 hour expiration in milliseconds
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error generating token" });
  }
});

// Logout endpoint
app.post("/logout", authenticateJWT, (req: Request, res: Response) => {
  // Clear the JWT cookie by setting its expiration date in the past
  res.cookie("jwt", "", {
    httpOnly: true, // Prevent JavaScript access to cookie
    secure: true, // Only use secure in production
    sameSite: "strict", // Prevents CSRF attacks
    expires: new Date(0), // Set expiry to the past to invalidate the cookie
  });

  // Send response confirming logout
  return res.status(200).json({ message: "Logged out successfully" });
});

// Delete account endpoint
app.delete(
  "/delete-account",
  authenticateJWT,
  async (req: Request, res: Response) => {
    const userId = req.user.id; // We already have user information after authentication

    try {
      // Delete the user from the database
      const stmt = await db.prepare("DELETE FROM users WHERE id = ?");
      await stmt.run(userId);
      await stmt.finalize();

      // Optionally, clear the JWT cookie (log out the user)
      res.cookie("jwt", "", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(0), // Expiry set to past to invalidate the cookie
      });

      // Return success response
      return res.status(200).json({ message: "Account deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Error deleting account. Please try again.",
      });
    }
  },
);

app.get("/get-score", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Fetch user's score from the database
    const user = await db.get("SELECT score FROM users WHERE id = ?", userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ score: user.score });
  } catch (error) {
    console.error("Error fetching user score:", error);
    return res.status(500).json({ error: "Failed to fetch score" });
  }
});

app.put(
  "/update-score",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { score } = req.body;

      // Validate that the score is a number
      if (typeof score !== "number") {
        return res.status(400).json({
          error: "Invalid score format. Must be a number.",
        });
      }

      // Update the user's score in the database
      const stmt = await db.prepare("UPDATE users SET score = ? WHERE id = ?");
      await stmt.run(score, userId);
      await stmt.finalize();

      return res.status(200).json({ message: "Score updated successfully" });
    } catch (error) {
      console.error("Error updating user score:", error);
      return res.status(500).json({ error: "Failed to update score" });
    }
  },
);

// API endpoint to get leaderboard data
app.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    // Get leaderboard data from the database
    const rows = await db.all(
      "SELECT username, score FROM users ORDER BY score DESC LIMIT 10",
    );

    // Map the result to include rank based on sorted score
    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
    }));

    return res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
