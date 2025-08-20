const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { authenticate } = require("../middlewares/auth");
const applicationController = require("../controllers/applicationController");

// Get all applications for logged in user
router.get(
  "/my-applications",
  authenticate,
  applicationController.getUserApplications
);

// Get all applications for a job (company only)
router.get(
  "/job/:jobId",
  authenticate,
  applicationController.getJobApplications
);

// Apply for a job
router.post(
  "/:jobId/apply",
  authenticate,
  upload.single("resume"),
  applicationController.applyForJob
);

// Get application status
router.get("/:id", authenticate, applicationController.getApplicationStatus);

// Update application status (company only)
router.patch(
  "/:id/status",
  authenticate,
  applicationController.updateApplicationStatus
);

module.exports = router;

module.exports = router;
