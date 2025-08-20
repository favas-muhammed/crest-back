const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const profileController = require("../controllers/profileController");

// Get user profile
router.get("/profile", authenticate, profileController.getProfile);

// Create or update user profile
router.post("/profile", authenticate, profileController.createOrUpdateProfile);

module.exports = router;
