// filepath: mern-crud-gmail-auth-app/backend/src/controllers/profileController.js
const UserProfile = require("../models/userProfile");

const getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

const createOrUpdateProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user._id });
    if (profile) {
      // Update profile
      Object.assign(profile, req.body);
      profile.isProfileSubmitted = true;
      await profile.save();
      res.status(200).json({ message: "Profile updated", profile });
    } else {
      // Create new profile
      profile = await UserProfile.create({
        ...req.body,
        user: req.user._id,
        isProfileSubmitted: true,
      });
      res.status(201).json({ message: "Profile created", profile });
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving profile", error });
  }
};

module.exports = { getProfile, createOrUpdateProfile };
