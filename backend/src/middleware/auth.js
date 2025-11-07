const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access token required shrinky dink",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    // Add user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Middleware to check user type
const requireUserType = (userType) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.userId);
      if (user.user_type !== userType) {
        return res.status(403).json({
          error: `This endpoint requires ${userType} access`,
        });
      }
      next();
    } catch (error) {
      console.error("User type check error:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};

module.exports = {
  authenticateToken,
  requireUserType,
};
