import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 160,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email."]
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    }
  }
});

export default mongoose.model("User", userSchema);
