const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  console.log("Auth Middleware - Headers:", req.headers);
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Extract the token from the Bearer scheme
    const token = authHeader.replace("Bearer ", "");

    // Verify the token
    console.log("Token:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find the user
    const user = await User.findById(decoded.id);
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (ex) {
    console.error("Auth middleware error:", ex);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { authenticate };
