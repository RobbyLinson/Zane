const express = require("express");
const {
  getStripeOnboardingLink,
  getEarnings,
  withdrawUserBalance,
  updateProfile,
} = require("../controllers/user");
const { authenticateToken, requireUserType } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/stripe-onboarding-link", requireUserType("creator"), getStripeOnboardingLink);
router.get("/earnings", requireUserType("creator"), getEarnings);
router.post("/withdraw", requireUserType("creator"), withdrawUserBalance);
router.put("/profile", updateProfile);

module.exports = router;
