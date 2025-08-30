const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { testConnection, initDatabase } = require("./utils/database");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Test database on startup
testConnection().then((success) => {
  if (success) {
    initDatabase();
  }
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CPM Tool API is running" });
});

// Auth routes
app.use("/api/auth", require("./routes/auth"));

module.exports = app;
