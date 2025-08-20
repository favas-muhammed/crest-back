const express = require("express");
const router = express.Router();
const {
  googleAuth,
  googleCallback,
  logout,
  verifyGoogleToken,
} = require("../controllers/authController");

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/logout", logout);
router.post("/google/verify", verifyGoogleToken);

module.exports = router;
