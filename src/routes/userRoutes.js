const express = require("express");
const {
  registerUser,
  loginUser,
  getUserData,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Route for user registration
router.post("/register", registerUser);

// Route for user login
router.post("/login", loginUser);

// Route for fetching user data (protected)
router.get("/me", authMiddleware, getUserData);

module.exports = router;
