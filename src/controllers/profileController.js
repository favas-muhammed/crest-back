const { UserProfile } = require("../models");

exports.getProfile = async (req, res) => {
  try {
    console.log("getProfile - User from request:", req.user);
    const profile = await UserProfile.findOne({ user: req.user._id });
    console.log("getProfile - Found profile:", profile);

    if (!profile) {
      console.log("getProfile - No profile found, returning 404");
      // Return a 404 to indicate profile needs to be created
      return res.status(404).json({
        message: "Profile not found. Please complete your profile.",
        user: req.user._id,
        email: req.user.email,
      });
    }
    console.log("getProfile - Returning profile");
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      contactNumber,
      dateOfBirth,
      country,
      registerAs,
    } = req.body;

    // Validate required fields and ensure they're not empty strings
    const requiredFields = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      address: address?.trim(),
      contactNumber: contactNumber?.trim(),
      dateOfBirth: dateOfBirth,
      country: country?.trim(),
      registerAs: registerAs,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields: missingFields,
      });
    }

    // Find existing profile
    let profile = await UserProfile.findOne({ user: req.user._id });

    if (profile) {
      // Check if immutable fields were previously saved with non-empty values
      const existingFields = {
        firstName: profile.firstName?.trim(),
        lastName: profile.lastName?.trim(),
        dateOfBirth: profile.dateOfBirth,
      };

      // Check if any immutable fields are being modified after being set
      const modifiedFields = Object.entries({
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        dateOfBirth: dateOfBirth,
      }).filter(([key, newValue]) => {
        const existingValue = existingFields[key];
        return existingValue && existingValue !== newValue;
      });

      if (modifiedFields.length > 0) {
        return res.status(400).json({
          message: `Cannot modify these fields once they are set: ${modifiedFields
            .map(([key]) => key)
            .join(", ")}`,
        });
      }

      // Update all fields
      profile.address = address;
      profile.contactNumber = contactNumber;
      profile.country = country;

      // Only set immutable fields if they haven't been set before
      if (!profile.firstName?.trim()) profile.firstName = firstName;
      if (!profile.lastName?.trim()) profile.lastName = lastName;
      if (!profile.dateOfBirth) profile.dateOfBirth = dateOfBirth;

      // Only allow registerAs to be set if profile hasn't been submitted yet
      if (!profile.isProfileSubmitted) {
        profile.registerAs = registerAs;
        profile.isProfileSubmitted = true; // Mark as submitted when registerAs is set
      } else if (registerAs !== profile.registerAs) {
        return res.status(400).json({
          message:
            "Registration type cannot be changed after initial submission",
        });
      }
    } else {
      // Create new profile
      profile = new UserProfile({
        user: req.user._id,
        email: req.user.email,
        firstName,
        lastName,
        address,
        contactNumber,
        dateOfBirth,
        country,
        registerAs,
        isProfileSubmitted: true, // Set this to true on first submission
      });
    }

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Profile already exists for this user",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
