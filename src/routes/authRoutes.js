const express = require("express");
const router = express.Router();
const {
  googleAuth,
  googleCallback,
  logout,
} = require("../controllers/authController");

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/logout", logout);

module.exports = router;
