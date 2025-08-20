const passport = require("passport");
const generateToken = require("../../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }

    const token = generateToken(user);
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  })(req, res, next);
};

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.FRONTEND_URL);
  });
};

const verifyGoogleToken = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await new User({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        accountType: "individual", // default account type
      }).save();
    }

    // Check if user has completed their profile
    const { UserProfile } = require("../models");
    const profile = await UserProfile.findOne({ user: user._id });

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileComplete: !!profile,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Failed to authenticate user" });
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  logout,
  verifyGoogleToken,
};
