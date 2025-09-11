const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payments");
const { authenticateToken } = require("../middleware/auth");

// Brand funds a contract
router.post(
  "/fund/:contractId",
  authenticateToken,
  paymentController.fundContract
);

// Confirm campaign funding
router.post(
  "/campaign/:campaignId/confirm",
  authenticateToken,
  paymentController.confirmCampaignFunding
);

// Update campaign views
router.post(
  "/campaign/:campaignId/views",
  authenticateToken,
  paymentController.updateViews
);

// Create payout
router.post(
  "/campaign/:campaignId/payout",
  authenticateToken,
  paymentController.createPayout
);

// Process payout
router.post(
  "/payout/:payoutId/process",
  authenticateToken,
  paymentController.processPayout
);

module.exports = router;
