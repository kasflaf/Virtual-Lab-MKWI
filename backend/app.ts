// Backend: src/index.ts
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

// Types
interface User {
  id: number;
  email: string;
  password: string;
}

interface AuthRequest extends express.Request {
  user?: {
    id: number;
    email: string;
  };
}

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

// Database setup
async function setupDatabase() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

// Express app setup
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Authentication middleware
const authenticateToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Routes
async function setupRoutes() {
  const db = await setupDatabase();

  // Register
  app.post(
    "/api/register",
    [
      body("email").isEmail(),
      body("password").isLength({ min: 6 }),
    ],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await db.get(
          "SELECT * FROM users WHERE email = ?",
          email,
        );
        if (existingUser) {
          return res.status(400).json({ error: "Email already registered" });
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db.run(
          "INSERT INTO users (email, password) VALUES (?, ?)",
          [email, hashedPassword],
        );

        const token = jwt.sign(
          { id: result.lastID, email },
          JWT_SECRET,
          { expiresIn: "24h" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(201).json({ message: "User created successfully" });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Login
  app.post(
    "/api/login",
    [
      body("email").isEmail(),
      body("password").exists(),
    ],
    async (req: express.Request, res: express.Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await db.get(
          "SELECT * FROM users WHERE email = ?",
          email,
        ) as User;
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "24h" },
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ message: "Login successful" });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  // Logout
  app.post("/api/logout", (req: express.Request, res: express.Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  });

  // Get current user
  app.get(
    "/api/me",
    authenticateToken,
    (req: AuthRequest, res: express.Response) => {
      res.json({ user: req.user });
    },
  );

  return app;
}

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  const app = await setupRoutes();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

// Frontend: src/api/auth.ts
export async function register(email: string, password: string) {
  const response = await fetch("http://localhost:5000/api/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch("http://localhost:5000/api/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch("http://localhost:5000/api/me", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get user");
  }

  return response.json();
}

// Frontend: src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";

interface AuthContextType {
  user: { id: number; email: string } | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Frontend: src/components/LoginForm.tsx
import React, { useState } from "react";
import { login } from "../api/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      window.location.reload(); // Refresh to update auth state
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
