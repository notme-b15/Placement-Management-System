import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from backend/.env");
}

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow tools such as curl/Postman (no Origin header) and configured clients.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("This origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "1mb" }));

// Request logging middleware.
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Placement Management API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

// 404 handler.
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Centralized error handler.
app.use((error, _req, res, _next) => {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({ error: "This email is already registered." });
  }
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)[0]?.message || "Database validation failed.";
    return res.status(400).json({ error: message });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ error: "Invalid database ID or value." });
  }
  if (error.message?.includes("CORS")) {
    return res.status(403).json({ error: error.message });
  }

  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Placement API listening on port ${PORT}`);
  });
} catch (error) {
  console.error("Unable to start the API:", error.message);
  process.exit(1);
}
