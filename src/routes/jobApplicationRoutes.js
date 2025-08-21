const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const jobController = require("../controllers/jobController");

// Routes specific to job applications will be added here

module.exports = router;
