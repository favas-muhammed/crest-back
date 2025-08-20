// filepath: mern-crud-gmail-auth-app/backend/src/controllers/userController.js
const User = require("../models/user");
const { UserProfile } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create a new user
exports.registerUser = async (req, res) => {
  const { email, password, accountType } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, accountType });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Authenticate user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user profile first (if exists)
    await UserProfile.findOneAndDelete({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Error deleting account", error });
  }
};

// Get user data
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
};
