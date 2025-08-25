const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const leadRoutes = require("./routes/leads");

const app = express();

// Parse JSON bodies first
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration for production cross-origin cookie handling
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "https://lms-virid-one.vercel.app",
      // Add your actual Vercel domain if different
    ].filter(Boolean);

    console.log(
      "CORS check - Origin:",
      origin,
      "Allowed:",
      allowedOrigins.includes(origin)
    );

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      // In production, be more lenient for debugging
      if (
        process.env.NODE_ENV === "production" &&
        origin.includes("vercel.app")
      ) {
        console.log("Allowing Vercel origin in production:", origin);
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours preflight cache
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Explicit preflight handling for production
app.options("*", cors(corsOptions));

// Additional middleware for production cookie and CORS handling
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers explicitly for production
  if (process.env.NODE_ENV === "production") {
    // Allow credentials for cross-origin requests
    res.header("Access-Control-Allow-Credentials", "true");

    // Set vary header to prevent caching issues
    res.header("Vary", "Origin, Access-Control-Request-Headers");

    // Ensure proper origin is reflected
    if (
      origin &&
      (origin.includes("vercel.app") || origin.includes("localhost"))
    ) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    // Additional cookie-related headers
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  }

  // Log request details for debugging
  console.log(`${req.method} ${req.path}`, {
    origin: origin,
    cookies: Object.keys(req.cookies),
    hasAccessToken: !!req.cookies?.accessToken,
    hasRefreshToken: !!req.cookies?.refreshToken,
    userAgent: req.headers["user-agent"]?.substring(0, 50),
  });

  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error("Error occurred:", {
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
  });

  // CORS error handling
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Access denied",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Catch-all route for 404 errors
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// MongoDB connection with enhanced error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("Connected to MongoDB");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Client URL:", process.env.CLIENT_URL);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  mongoose.connection.close(() => {
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(
    `Allowed origins: ${process.env.CLIENT_URL}, https://lms-virid-one.vercel.app`
  );
});
