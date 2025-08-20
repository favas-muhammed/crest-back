const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  registerAs: {
    type: String,
    enum: ["company", "sales"],
    required: true,
  },
  isProfileSubmitted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
userProfileSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
