// controllers/tiktokController.js - Add these methods to your existing campaign controller

const TikTokService = require("../services/tiktok");
const { Campaign, Contract, User } = require("../models");

const tiktokService = new TikTokService();

// TikTok OAuth initiation
const initiateTikTokAuth = async (req, res) => {
  try {
    const userId = req.user.userId;
    const redirectUri = `${process.env.FRONTEND_URL}/api/tiktok/callback`;

    const authUrl = tiktokService.getAuthURL(redirectUri, userId);

    res.json({
      success: true,
      authUrl: authUrl,
    });
  } catch (error) {
    console.error("TikTok auth initiation error:", error);
    res.status(500).json({ error: "Failed to initiate TikTok authentication" });
  }
};

const handleTikTokCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // userId from state parameter
    const redirectUri = `${process.env.BASE_URL}/api/tiktok/callback`;
    console.log("Redirect URI:", redirectUri);

    if (!code) {
      return res.redirect(
        `${process.env.BASE_URL}/dashboard?tiktok_error=access_denied`
      );
    }

    // Exchange code for access token
    const tokenData = await tiktokService.getAccessToken(
      code,
      redirectUri,
      userId
    );

    // Store token for user
    tiktokService.storeAccessToken(userId, tokenData);

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?tiktok_connected=true`);
  } catch (error) {
    console.error("TikTok callback error:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?tiktok_error=${encodeURIComponent(
        error.message
      )}`
    );
  }
};
// Submit TikTok content URL to campaign
const submitCampaignContent = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { tiktokUrl } = req.body;
    const userId = req.user.userId;

    if (!tiktokUrl) {
      return res.status(400).json({ error: "TikTok URL is required" });
    }

    const result = await tiktokService.submitContentToCampaign(
      campaignId,
      tiktokUrl,
      userId
    );

    res.json(result);
  } catch (error) {
    console.error("Submit campaign content error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update single campaign with current TikTok views
const updateCampaignViews = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.userId;

    // Get valid access token
    const accessToken = await tiktokService.getValidAccessToken(userId);

    // Update campaign views
    const result = await tiktokService.updateCampaignViews(
      campaignId,
      accessToken
    );

    res.json(result);
  } catch (error) {
    console.error("Update campaign views error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update all campaigns for current user
const updateAllCampaignViews = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get valid access token
    const accessToken = await tiktokService.getValidAccessToken(userId);

    // Update all campaigns
    const result = await tiktokService.updateAllUserCampaigns(
      userId,
      accessToken
    );

    res.json(result);
  } catch (error) {
    console.error("Update all campaigns error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get campaign analytics with live TikTok stats
const getCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user.userId;

    let accessToken = null;
    try {
      accessToken = await tiktokService.getValidAccessToken(userId);
    } catch (error) {
      console.log("No TikTok access token available:", error.message);
    }

    const result = await tiktokService.getCampaignAnalytics(
      campaignId,
      accessToken
    );

    res.json(result);
  } catch (error) {
    console.error("Get campaign analytics error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Check TikTok connection status
const getTikTokConnectionStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tokenData = tiktokService.getStoredAccessToken(userId);

    res.json({
      success: true,
      connected: !!tokenData,
      expires_at: tokenData ? tokenData.expires_at : null,
    });
  } catch (error) {
    console.error("Get TikTok status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Disconnect TikTok account
const disconnectTikTok = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Remove stored token (in production, remove from database)
    tiktokService.accessTokens.delete(userId);

    res.json({
      success: true,
      message: "TikTok account disconnected successfully",
    });
  } catch (error) {
    console.error("Disconnect TikTok error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ENHANCED VERSION OF YOUR EXISTING getCampaigns METHOD
// This adds TikTok view tracking functionality
const getCampaignsWithTikTokStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.user_type;

    let where = {};
    if (userType === "creator") {
      where.creator_id = userId;
    } else if (userType === "brand") {
      where.brand_id = userId;
    }

    const campaigns = await Campaign.findAll({
      where,
      include: [
        { model: Contract, as: "contract" },
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

    // If user is creator and has TikTok connected, try to update view counts
    if (userType === "creator") {
      try {
        const accessToken = await tiktokService.getValidAccessToken(userId);

        // Update campaigns with content URLs
        for (const campaign of campaigns) {
          if (campaign.content_url && campaign.status === "tracking") {
            try {
              await tiktokService.updateCampaignViews(campaign.id, accessToken);
            } catch (error) {
              console.log(
                `Failed to update campaign ${campaign.id}:`,
                error.message
              );
            }
          }
        }

        // Reload campaigns to get updated data
        const updatedCampaigns = await Campaign.findAll({
          where,
          include: [
            { model: Contract, as: "contract" },
            {
              model: User,
              as: "creator",
              attributes: ["id", "first_name", "last_name"],
            },
          ],
        });

        return res.json({
          campaigns: updatedCampaigns,
          tiktokConnected: true,
        });
      } catch (error) {
        // TikTok not connected or error - return campaigns without update
        console.log("TikTok not available for user:", error.message);
      }
    }

    res.json({
      campaigns,
      tiktokConnected: false,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  // Your existing methods stay the same
  // Add these new TikTok-specific methods:
  initiateTikTokAuth,
  handleTikTokCallback,
  submitCampaignContent,
  updateCampaignViews,
  updateAllCampaignViews,
  getCampaignAnalytics,
  getTikTokConnectionStatus,
  disconnectTikTok,
  getCampaignsWithTikTokStats, // Enhanced version of your existing method
};
