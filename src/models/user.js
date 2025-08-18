const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  country: { type: String },
  age: { type: Number },
  accountType: {
    type: String,
    enum: ["company", "individual"],
    required: true,
  },
  googleId: { type: String }, // For Gmail authentication
});

// Prevent OverwriteModelError in dev/test environments
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
