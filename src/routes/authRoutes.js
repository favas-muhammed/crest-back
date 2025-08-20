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
// Handle both OPTIONS and POST for /google/verify
router.options("/google/verify", (req, res) => res.status(200).end());
router.post("/google/verify", verifyGoogleToken);

module.exports = router;
