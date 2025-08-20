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
    console.log("Received profile data:", req.body);

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

      // Always allow updating these fields
      profile.address = address;
      profile.contactNumber = contactNumber;
      profile.country = country;

      // Handle immutable fields only if they haven't been set
      if (!profile.firstName?.trim()) {
        profile.firstName = firstName;
      } else if (firstName !== profile.firstName) {
        return res
          .status(400)
          .json({ message: "First name cannot be modified once set" });
      }

      if (!profile.lastName?.trim()) {
        profile.lastName = lastName;
      } else if (lastName !== profile.lastName) {
        return res
          .status(400)
          .json({ message: "Last name cannot be modified once set" });
      }

      // Handle date of birth with proper format comparison
      if (!profile.dateOfBirth) {
        console.log("Setting initial date of birth:", dateOfBirth);
        profile.dateOfBirth = new Date(dateOfBirth);
      } else {
        // Ensure we're working with Date objects
        const existingDate = new Date(profile.dateOfBirth);
        const newDate = new Date(dateOfBirth);

        console.log("Comparing dates:", {
          existingRaw: existingDate,
          newRaw: newDate,
          existingISO: existingDate.toISOString(),
          newISO: newDate.toISOString(),
        });

        // Compare the dates in YYYY-MM-DD format
        const existingFormatted = existingDate.toISOString().split("T")[0];
        const newFormatted = newDate.toISOString().split("T")[0];

        console.log("Formatted dates:", {
          existingFormatted,
          newFormatted,
          areEqual: existingFormatted === newFormatted,
        });

        if (existingFormatted !== newFormatted) {
          return res.status(400).json({
            message: "Date of birth cannot be modified once set",
            currentDate: existingFormatted,
            attemptedDate: newFormatted,
          });
        }
      }

      // All immutable field checks are now handled above

      // Handle registerAs field
      if (profile.registerAs && registerAs !== profile.registerAs) {
        return res.status(400).json({
          message:
            "Registration type cannot be changed after initial submission",
        });
      } else if (!profile.registerAs) {
        profile.registerAs = registerAs;
        profile.isProfileSubmitted = true;
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
    console.error("Error saving profile:", {
      error,
      stack: error.stack,
      code: error.code,
    });

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Profile already exists for this user",
        details: error.message,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      details: error.message,
    });
  }
};
