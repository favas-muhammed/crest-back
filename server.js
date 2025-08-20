const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const userRoutes = require("./src/routes/userRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
require("./src/config/passport");

dotenv.config();

// Create uploads directory if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

// CORS configuration
const corsOptions = {
  origin: "https://crest-front.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/users", userRoutes);
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/api", profileRoutes); // Profile routes under /api
app.use("/api/jobs", require("./src/routes/jobRoutes")); // Job routes
app.use("/api/applications", require("./src/routes/applicationRoutes")); // Application routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  console.error("Stack:", err.stack);

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// MongoDB connection
const connectDB = require("./src/config/database");
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
