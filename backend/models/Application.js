import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Student name is required."],
    trim: true,
    maxlength: 120
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    lowercase: true,
    trim: true,
    maxlength: 160,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email."]
  },
  company: {
    type: String,
    required: [true, "Company is required."],
    trim: true,
    maxlength: 120
  },
  position: {
    type: String,
    required: [true, "Position is required."],
    trim: true,
    maxlength: 120
  },
  cgpa: {
    type: Number,
    required: [true, "CGPA is required."],
    min: [0, "CGPA cannot be below 0."],
    max: [10, "CGPA cannot exceed 10."]
  },
  status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"],
    default: "Applied"
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export default mongoose.model("Application", applicationSchema);
