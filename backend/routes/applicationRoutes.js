import { Router } from "express";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import auth from "../middleware/auth.js";

const router = Router();
const allowedStatuses = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Selected",
  "Rejected"
];

function validateApplication(req, res, next) {
  const { studentName, email, company, position, cgpa } = req.body || {};
  if (![studentName, email, company, position].every(value =>
    typeof value === "string" && value.trim()
  )) {
    return res.status(400).json({
      error: "Student name, email, company and position are required."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Enter a valid email." });
  }

  const score = Number(cgpa);
  if (cgpa === "" || cgpa === undefined || !Number.isFinite(score) || score < 0 || score > 10) {
    return res.status(400).json({ error: "CGPA must be from 0 to 10." });
  }

  req.record = {
    studentName: studentName.trim(),
    email: email.toLowerCase().trim(),
    company: company.trim(),
    position: position.trim(),
    cgpa: score
  };
  next();
}

// Public read access is retained for the classroom demonstration.
router.get("/", async (_req, res, next) => {
  try {
    const records = await Application.find().sort({ createdAt: -1 });
    res.json({ data: records });
  } catch (error) {
    next(error);
  }
});

// Create an application (JWT required).
router.post("/", auth, validateApplication, async (req, res, next) => {
  try {
    const record = await Application.create(req.record);
    res.status(201).json({ data: record, message: "Application created." });
  } catch (error) {
    next(error);
  }
});

// Update application status (JWT required).
router.put("/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid application ID." });
    }

    const { status } = req.body || {};
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "A valid status is required." });
    }

    const record = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({ data: record, message: "Status updated." });
  } catch (error) {
    next(error);
  }
});

// Delete an application (JWT required).
router.delete("/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid application ID." });
    }

    const record = await Application.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({ message: "Application deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
