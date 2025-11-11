const axios = require("axios");
const { Campaign, Contract, User } = require("../models");
const crypto = require("crypto");

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url"); // PKCE verifier
}

function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

class TikTokService {
  constructor() {
    this.clientKey = process.env.TIKTOK_CLIENT_KEY;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    this.baseURL = "https://open.tiktokapis.com";
    this.accessTokens = new Map(); // In production, store in database/Redis
  }

  // Step 1: Generate TikTok OAuth URL
  getAuthURL(redirectUri, userId) {
    // Validate required parameters
    if (!this.clientKey) {
      throw new Error("TIKTOK_CLIENT_KEY is not configured");
    }

    const scopes = ["video.list", "user.info.basic"].join(","); // Changed to comma-separated

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    this.accessTokens.set(`${userId}_verifier`, codeVerifier);

    // Build URL manually for better control
    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: scopes,
      response_type: "code",
      redirect_uri: redirectUri,
      state: userId.toString(), // Ensure state is a string
      // code_challenge: codeChallenge,
      // code_challenge_method: "S256",
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    console.log(
      "Generated auth URL (client_key present):",
      authUrl.substring(0, 100) + "..."
    );

    return authUrl;
  }

  // Step 2: Exchange authorization code for access token
  async getAccessToken(authCode, redirectUri, userId) {
    const codeVerifier = this.accessTokens.get(`${userId}_verifier`);
    if (!codeVerifier) {
      throw new Error("Missing code_verifier for PKCE");
    }
    try {
      const response = await axios.post(
        `${this.baseURL}/v2/oauth/token/`,
        {
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          code: authCode,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          // code_verifier: codeVerifier, // <-- REQUIRED for PKCE
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "TikTok token exchange error:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  // Step 3: Extract video ID from various TikTok URL formats
  // Step 3: Extract video ID from various TikTok URL formats
  async extractVideoId(tiktokUrl, accessToken) {
    const patterns = [
      { regex: /tiktok\.com\/@[^\/]+\/video\/(\d+)/, type: "numeric" }, // Standard format
      { regex: /vm\.tiktok\.com\/([A-Za-z0-9]+)/, type: "short" }, // Mobile share format
      { regex: /tiktok\.com\/t\/([A-Za-z0-9]+)/, type: "short" }, // Short format
      { regex: /tiktok\.com.*\/video\/(\d+)/, type: "numeric" }, // Catch variations
    ];

    for (const pattern of patterns) {
      const match = tiktokUrl.match(pattern.regex);
      if (match) {
        const videoIdOrCode = match[1];

        // If it's already numeric, return it
        if (pattern.type === "numeric") {
          return videoIdOrCode;
        }

        // If it's a short code, resolve it to numeric ID
        if (pattern.type === "short" && accessToken) {
          try {
            const response = await axios.get(tiktokUrl, {
              maxRedirects: 0,
              validateStatus: (status) => status < 500,
            });

            // Extract video ID from redirect URL
            const redirectUrl = response.headers.location;
            const videoIdMatch = redirectUrl?.match(/\/video\/(\d+)/);
            if (videoIdMatch) {
              return videoIdMatch[1];
            }
          } catch (error) {
            console.error("Failed to resolve short code:", error.message);
          }
        }

        // Fallback: return the short code (will likely fail, but better error message)
        return videoIdOrCode;
      }
    }

    throw new Error(
      "Invalid TikTok URL format. Please use a valid TikTok video URL."
    );
  }

  // Step 4: Get video statistics from TikTok API
  async getVideoStats(videoId, accessToken) {
    try {
      // Ensure videoId is a string
      const videoIdStr = String(videoId);

      const response = await axios.post(
        `${this.baseURL}/v2/video/query/`,
        {
          filters: {
            video_ids: [videoIdStr],
          },
        },
        {
          params: {
            fields:
              "id,title,view_count,like_count,comment_count,share_count,create_time",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data.data &&
        response.data.data.videos &&
        response.data.data.videos.length > 0
      ) {
        return response.data.data.videos[0];
      }

      throw new Error("Video not found or not accessible");
    } catch (error) {
      console.error("TikTok API error:", error.response?.data || error.message);
      throw new Error(
        `Failed to get video stats: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }
  // Step 5: Submit content URL to campaign (when creator uploads TikTok)
  async submitContentToCampaign(campaignId, tiktokUrl, userId) {
    try {
      // Find the campaign and verify ownership
      const campaign = await Campaign.findOne({
        where: { id: campaignId, creator_id: userId },
        include: [{ model: Contract, as: "contract" }],
      });

      if (!campaign) {
        throw new Error("Campaign not found or unauthorized");
      }

      if (campaign.status !== "accepted") {
        throw new Error("Campaign is not in accepted status");
      }

      // Extract and validate video ID
      const videoId = this.extractVideoId(tiktokUrl);

      // Update campaign with content URL and change status
      await campaign.update({
        content_url: tiktokUrl,
        status: "content_created",
        content_submitted_at: new Date(),
      });

      return {
        success: true,
        campaign: campaign,
        videoId: videoId,
        message: "Content submitted successfully",
      };
    } catch (error) {
      console.error("Submit content error:", error);
      throw error;
    }
  }

  // Step 6: Update campaign with current TikTok views
  async updateCampaignViews(campaignId, accessToken) {
    try {
      // Get campaign with contract for CPM calculation
      const campaign = await Campaign.findOne({
        where: { id: campaignId },
        include: [{ model: Contract, as: "contract" }],
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      if (!campaign.content_url) {
        throw new Error("No content URL found for this campaign");
      }

      // Extract video ID and get current stats
      const videoId = this.extractVideoId(campaign.content_url, accessToken);
      const videoStats = await this.getVideoStats(videoId, accessToken);

      // Update campaign with new view count
      await campaign.update({
        views_tracked: videoStats.view_count,
        last_tracked_at: new Date(),
        status:
          campaign.status === "content_created" ? "tracking" : campaign.status,
      });

      // Reload to get the virtual amount_earned calculation
      await campaign.reload({ include: [{ model: Contract, as: "contract" }] });

      return {
        success: true,
        campaign: campaign,
        views: videoStats.view_count,
        earnings: campaign.amount_earned,
        videoStats: {
          likes: videoStats.like_count,
          comments: videoStats.comment_count,
          shares: videoStats.share_count,
        },
      };
    } catch (error) {
      console.error("Update campaign views error:", error);
      throw error;
    }
  }

  // Step 7: Batch update all active campaigns for a user
  async updateAllUserCampaigns(userId, accessToken) {
    try {
      // Get all campaigns that have content URLs and are tracking
      const campaigns = await Campaign.findAll({
        where: {
          creator_id: userId,
          content_url: { [require("sequelize").Op.ne]: null },
          status: ["content_created", "tracking"],
        },
        include: [{ model: Contract, as: "contract" }],
      });

      const results = [];

      for (const campaign of campaigns) {
        try {
          const result = await this.updateCampaignViews(
            campaign.id,
            accessToken
          );
          results.push({
            campaignId: campaign.id,
            success: true,
            views: result.views,
            earnings: result.earnings,
          });
        } catch (error) {
          console.error(
            `Failed to update campaign ${campaign.id}:`,
            error.message
          );
          results.push({
            campaignId: campaign.id,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        updated: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results: results,
      };
    } catch (error) {
      console.error("Batch update campaigns error:", error);
      throw error;
    }
  }

  // Step 8: Get campaign analytics/dashboard
  async getCampaignAnalytics(campaignId, accessToken) {
    try {
      const campaign = await Campaign.findOne({
        where: { id: campaignId },
        include: [
          { model: Contract, as: "contract" },
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      let videoStats = null;
      if (campaign.content_url && accessToken) {
        try {
          const videoId = this.extractVideoId(campaign.content_url);
          const stats = await this.getVideoStats(videoId, accessToken);
          videoStats = {
            views: stats.view_count,
            likes: stats.like_count,
            comments: stats.comment_count,
            shares: stats.share_count,
            title: stats.title,
          };
        } catch (error) {
          console.log("Could not fetch live stats:", error.message);
        }
      }

      return {
        success: true,
        campaign: {
          id: campaign.id,
          content_url: campaign.content_url,
          views_tracked: campaign.views_tracked,
          amount_earned: campaign.amount_earned,
          amount_withdrawn: campaign.amount_withdrawn,
          status: campaign.status,
          last_tracked_at: campaign.last_tracked_at,
          content_submitted_at: campaign.content_submitted_at,
          max_payout: campaign.max_payout,
        },
        contract: campaign.contract,
        creator: campaign.creator,
        liveStats: videoStats,
      };
    } catch (error) {
      console.error("Get campaign analytics error:", error);
      throw error;
    }
  }

  // Token management methods (store in database in production)
  storeAccessToken(userId, tokenData) {
    this.accessTokens.set(userId, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    });
  }

  getStoredAccessToken(userId) {
    return this.accessTokens.get(userId);
  }

  async refreshAccessToken(userId) {
    const tokenData = this.getStoredAccessToken(userId);
    if (!tokenData || !tokenData.refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await axios.post(`${this.baseURL}/v2/oauth/token/`, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token,
      });

      this.storeAccessToken(userId, response.data);
      return response.data.access_token;
    } catch (error) {
      console.error(
        "Token refresh error:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  // Helper to get valid access token (refresh if needed)
  async getValidAccessToken(userId) {
    const tokenData = this.getStoredAccessToken(userId);
    if (!tokenData) {
      throw new Error("User not authenticated with TikTok");
    }

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= tokenData.expires_at - 300000) {
      return await this.refreshAccessToken(userId);
    }

    return tokenData.access_token;
  }
}

module.exports = TikTokService;
