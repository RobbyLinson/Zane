const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { createStripeAccount } = require("../services/stripe");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, user_type, first_name, last_name, company_name } =
      req.body;

    // Validation
    if (!email || !password || !user_type || !first_name || !last_name) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (user_type === "brand" && !company_name) {
      return res.status(400).json({
        error: "Company name is required for brands",
      });
    }

    if (!["creator", "brand"].includes(user_type)) {
      return res.status(400).json({
        error: "User type must be creator or brand",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    const userData = { email, first_name, last_name, user_type, company_name };

    let stripe_account_id = await createStripeAccount(userData);

    // Create user
    console.log("Creating user with stripe_id:", stripe_account_id);
    const user = await User.create({
      email,
      password,
      user_type,
      first_name,
      last_name,
      stripe_account_id,
      company_name: user_type === "brand" ? company_name : null,
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: "User registered successfully",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: "Account is deactivated",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
