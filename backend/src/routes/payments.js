const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments");
const { authenticateToken } = require("../middleware/auth");

// Brand funds a contract
router.post(
  "/contracts/fund-draft",
  authenticateToken,
  paymentsController.fundContractDraft
);

// Confirm campaign funding
router.post(
  "/campaign/:campaignId/confirm",
  authenticateToken,
  paymentsController.confirmCampaignFunding
);

// Update campaign views
router.post(
  "/campaign/:campaignId/views",
  authenticateToken,
  paymentsController.updateViews
);

// Create payout
router.post(
  "/campaign/:campaignId/payout",
  authenticateToken,
  paymentsController.createPayout
);

// Process payout
router.post(
  "/payout/:payoutId/process",
  authenticateToken,
  paymentsController.processPayout
);

module.exports = router;
