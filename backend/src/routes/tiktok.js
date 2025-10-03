// routes/tiktok.js - Add these routes to your existing routes or create new router

const express = require("express");
const {
  initiateTikTokAuth,
  handleTikTokCallback,
  submitCampaignContent,
  updateCampaignViews,
  updateAllCampaignViews,
  getCampaignAnalytics,
  getTikTokConnectionStatus,
  disconnectTikTok,
} = require("../controllers/tiktok");

const { authenticateToken, requireUserType } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

// TikTok OAuth Routes
router.get("/auth", initiateTikTokAuth);
router.get("/callback", handleTikTokCallback); // No auth needed for OAuth callback

// TikTok Connection Management
router.get("/status", getTikTokConnectionStatus);
router.delete("/disconnect", disconnectTikTok);

// Campaign Content Management
router.post("/campaigns/:campaignId/submit-content", submitCampaignContent);
router.put("/campaigns/:campaignId/update-views", updateCampaignViews);
router.put("/campaigns/update-all-views", updateAllCampaignViews);
router.get("/campaigns/:campaignId/analytics", getCampaignAnalytics);

module.exports = router;
