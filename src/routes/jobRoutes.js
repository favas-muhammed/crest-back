const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const jobController = require("../controllers/jobController");

// Create a new job posting
router.post("/", authenticate, jobController.createJob);

// Get all active jobs
router.get("/", jobController.getAllJobs);

// Get all jobs posted by the company
router.get("/company-jobs", authenticate, jobController.getCompanyJobs);

// Get a specific job by ID
router.get("/:id", authenticate, jobController.getJob);

// Update a job posting
router.put("/:id", authenticate, jobController.updateJob);

// Delete a job posting
router.delete("/:id", authenticate, jobController.deleteJob);

module.exports = router;
