const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { authenticateToken } = require("../middlewares/auth");
const applicationController = require("../controllers/applicationController");

// Log applicationController methods to verify their existence
console.log(
  "applicationController methods:",
  Object.keys(applicationController)
);

// Get all applications for logged in user (this must come before /:id route)
router.get("/my-applications", authenticateToken, (req, res) => {
  applicationController.getUserApplications(req, res);
});

// Get all applications for a job (company only) (this must come before /:id route)
router.get("/job/:jobId", authenticateToken, (req, res) => {
  console.log("Route /job/:jobId - req.params:", req.params);
  console.log("Route /job/:jobId - req.user:", req.user);
  console.log(
    "Route /job/:jobId - applicationController:",
    applicationController
  );
  console.log(
    "Route /job/:jobId - applicationController.getJobApplications:",
    applicationController.getJobApplications
  );
  if (typeof applicationController.getJobApplications !== "function") {
    return res
      .status(500)
      .json({ message: "getJobApplications is not a function" });
  }
  applicationController.getJobApplications(req, res);
});

// Apply for a job
router.post(
  "/:jobId/apply",
  authenticateToken,
  upload.single("resume"),
  (req, res) => {
    applicationController.applyForJob(req, res);
  }
);

// Get application status
router.get("/:id", authenticateToken, (req, res) => {
  applicationController.getApplicationStatus(req, res);
});

// Update application status (company only)
router.patch("/:id/status", authenticateToken, (req, res) => {
  applicationController.updateApplicationStatus(req, res);
});

module.exports = router;
