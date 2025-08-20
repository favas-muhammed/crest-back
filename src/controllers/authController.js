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
    console.log('Starting Google token verification...');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', 'https://crest-front.vercel.app');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.status(200).end();
    }

    console.log('Request body:', req.body);
    const { credential } = req.body;
    
    if (!credential) {
      console.log('No credential provided');
      return res.status(400).json({ message: "No credential provided" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not set');
      return res.status(500).json({ message: "Server configuration error" });
    }

    console.log('Verifying token with client ID:', process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Token verified successfully');

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
    console.error("Error stack:", error.stack);
    
    if (!client) {
      console.error("OAuth2Client not initialized");
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (error.message.includes('Invalid token')) {
      return res.status(401).json({ message: "Invalid token provided" });
    }

    return res.status(500).json({ 
      message: "Authentication failed", 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  logout,
  verifyGoogleToken,
};
