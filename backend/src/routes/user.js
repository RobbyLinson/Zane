const express = require("express");
const {
  getStripeOnboardingLink,
  getUserProfile,
} = require("../controllers/user");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/stripe-onboarding-link", getStripeOnboardingLink);

router.get("/profile", getUserProfile);

module.exports = router;
