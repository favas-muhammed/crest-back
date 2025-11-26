const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const {
  getNotifications,
  createNotification,
  markAsRead,
} = require("../controllers/notificationController");

// Get all notifications for the authenticated user
router.get("/", authenticate, getNotifications);

// Create a new notification
router.post("/", authenticate, createNotification);

// Mark a notification as read
router.put("/:id/read", authenticate, markAsRead);

module.exports = router;
