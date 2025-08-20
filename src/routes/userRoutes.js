const express = require("express");
const {
  registerUser,
  loginUser,
  getUserData,
  deleteAccount,
} = require("../controllers/userController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

// Route for user registration
router.post("/register", registerUser);

// Route for user login
router.post("/login", loginUser);

// Route for fetching user data (protected)
router.get("/me", authenticate, getUserData);

// Route for deleting user account (protected)
router.delete("/delete-account", authenticate, deleteAccount);

module.exports = router;
