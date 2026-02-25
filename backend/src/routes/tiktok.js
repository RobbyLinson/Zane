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

router.get("/callback", handleTikTokCallback); // No auth needed for OAuth callback

router.use(authenticateToken);

// TikTok OAuth Routes
router.get("/auth", initiateTikTokAuth);

// TikTok Connection Management
router.get("/status", getTikTokConnectionStatus);
router.delete("/disconnect", disconnectTikTok);

// Campaign Content Management
// Static route must come before the parameterized route to avoid /:campaignId capturing "views"
router.post("/campaigns/views/sync", updateAllCampaignViews);
router.post("/campaigns/:campaignId/content", submitCampaignContent);
router.patch("/campaigns/:campaignId/views", updateCampaignViews);
router.get("/campaigns/:campaignId/analytics", getCampaignAnalytics);

module.exports = router;
