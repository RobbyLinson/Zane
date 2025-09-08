const validateRegistration = (req, res, next) => {
  const { email, password, first_name, last_name } = req.body;
  const errors = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email is required");
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  // Name validation
  if (!first_name || first_name.trim().length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (!last_name || last_name.trim().length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateRegistration,
};
