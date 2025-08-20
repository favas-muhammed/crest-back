const Job = require("../models/job");
const { UserProfile } = require("../models");
const fs = require("fs").promises;

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id;
    const { coverLetter } = req.body;
    const resumeFile = req.file;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "active") {
      return res
        .status(400)
        .json({ message: "This job is no longer accepting applications" });
    }

    // Check if user has already applied
    const existingApplication = job.applications.find(
      (app) => app.applicant.toString() === userId.toString()
    );

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    // Get applicant profile
    const applicantProfile = await UserProfile.findOne({ user: userId });
    if (!applicantProfile) {
      return res.status(404).json({ message: "Applicant profile not found" });
    }

    // Add application to job
    job.applications.push({
      applicant: userId,
      resume: resumeFile.path,
      coverLetter,
      status: "pending",
    });

    await job.save();

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: job.applications[job.applications.length - 1]._id,
    });
  } catch (error) {
    console.error("Error in job application:", error);
    res
      .status(500)
      .json({ message: "Error submitting application", error: error.message });
  }
};

exports.getApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const job = await Job.findOne({ "applications._id": id });
    if (!job) {
      return res.status(404).json({ message: "Application not found" });
    }

    const application = job.applications.id(id);
    if (application.applicant.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      status: application.status,
      appliedAt: application.appliedAt,
    });
  } catch (error) {
    console.error("Error getting application status:", error);
    res.status(500).json({
      message: "Error getting application status",
      error: error.message,
    });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // First get the user's profile to verify they are a company
    const profile = await UserProfile.findOne({ user: userId });
    if (!profile || profile.registerAs !== "company") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await Job.findById(jobId).populate({
      path: "applications.applicant",
      select: "firstName lastName email",
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(job.applications);
  } catch (error) {
    console.error("Error getting job applications:", error);
    res.status(500).json({
      message: "Error getting job applications",
      error: error.message,
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // First get the user's profile to verify they are a company
    const profile = await UserProfile.findOne({ user: userId });
    if (!profile || profile.registerAs !== "company") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await Job.findOne({ "applications._id": id });
    if (!job) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (job.company.toString() !== profile._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const application = job.applications.id(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await job.save();

    res.json({ message: "Application status updated successfully", status });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      message: "Error updating application status",
      error: error.message,
    });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const jobs = await Job.find({
      "applications.applicant": userId,
    })
      .select("title company applications.$")
      .populate("company", "companyName");

    const applications = jobs.map((job) => ({
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.company.companyName,
      application: job.applications.find(
        (app) => app.applicant.toString() === userId.toString()
      ),
    }));

    res.json(applications);
  } catch (error) {
    console.error("Error getting user applications:", error);
    res.status(500).json({
      message: "Error getting user applications",
      error: error.message,
    });
  }
};

const {
  applyForJob,
  getApplicationStatus,
  getJobApplications,
  updateApplicationStatus,
  getUserApplications,
} = exports;

module.exports = {
  applyForJob,
  getApplicationStatus,
  getJobApplications,
  updateApplicationStatus,
  getUserApplications,
};
