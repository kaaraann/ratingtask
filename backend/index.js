const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const storeOwnerRoutes = require("./routes/storeOwner");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://steadfast-growth-production-88ad.up.railway.app",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/store-owner", storeOwnerRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
