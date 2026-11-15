import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

// Register an administrator account.
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (![name, email, password].every(value =>
      typeof value === "string" && value.trim()
    )) {
      return res.status(400).json({
        error: "Name, email and password are required."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    res.status(201).json({
      token: signToken(user),
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
});

// Login.
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
      token: signToken(user),
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
