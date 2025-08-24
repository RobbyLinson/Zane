const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CPM Tool API is running" });
});

// Routes (add as you build)
// app.use('/api/auth', require('./routes/auth'));

module.exports = app;
