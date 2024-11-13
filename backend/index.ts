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
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 3000;

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

// Middleware to authenticate JWT
const _authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).send("Authentication required");
    }

    // Generate a key for verification
    const key = await generateKey(JWT_SECRET);

    // Verify token using the generated key
    const decoded = await verify(token, key); // This will throw if invalid

    // Attach decoded token to req.user
    const decodedPayload = decoded as unknown as JwtPayload;

    // Attach the decoded payload (id and username) directly to req.user
    req.user = {
      id: decodedPayload.id,
      username: decodedPayload.username,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
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
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid username or password" });
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

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error generating token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
