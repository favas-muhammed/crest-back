const Job = require('../models/job');
const { UserProfile } = require('../models');

exports.createJob = async (req, res) => {
  try {
    const { title, description, requirements, location, salary } = req.body;
    const userId = req.user._id;

    // Check if user is a company
    const userProfile = await UserProfile.findOne({ user: userId });
    if (!userProfile || userProfile.registerAs !== 'company') {
      return res.status(403).json({ message: 'Only companies can post jobs' });
    }

    const newJob = new Job({
      title,
      description,
      requirements,
      company: userProfile._id,
      location,
      salary,
      postedBy: userId
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job posting', error: error.message });
  }
};

exports.getCompanyJobs = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get company profile
    const companyProfile = await UserProfile.findOne({ user: userId });
    if (!companyProfile || companyProfile.registerAs !== 'company') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Job.find({ company: companyProfile._id })
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'firstName lastName companyName');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job details', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job posting', error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user owns the job
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job posting', error: error.message });
  }
};
