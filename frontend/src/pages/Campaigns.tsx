import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { CampaignCard } from "../components/contracts/CampaignCard";
import type { Campaign } from "../types";

export const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const isCreator = user?.user_type === "creator";
  const isBrand = user?.user_type === "brand";

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        let response;
        if (isCreator) {
          response = await api.getMyCampaigns(); // GET /api/campaigns
        } else if (isBrand) {
          response = await api.getBrandCampaigns(); // GET /api/campaigns
        }
        setCampaigns(response.campaigns || []);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [isCreator, isBrand]);

  const handleContentSubmitted = () => {
    // Re-fetch campaigns to update status and view tracking
    setLoading(true);
    api
      .request("/tiktok/campaigns")
      .then((response) => setCampaigns(response.campaigns || []))
      .catch((err) => console.error("Failed to reload campaigns:", err))
      .finally(() => setLoading(false));
  };

  const handleUpdateViews = async () => {
    setLoading(true);
    try {
      await api.updateAllTikTokCampaignViews();
      // Re-fetch campaigns after updating views
      if (isCreator) {
        const response = await api.getMyCampaigns();
        setCampaigns(response.campaigns || []);
      } else if (isBrand) {
        const response = await api.getBrandCampaigns();
        setCampaigns(response.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to update TikTok views:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isCreator ? "Active Campaigns" : "Campaign Analytics"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isCreator
                  ? "Track your accepted campaigns and earnings"
                  : "View analytics for all creator campaigns"}
              </p>
            </div>
            {isCreator && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdateViews}
                disabled={loading}
              >
                Update TikTok Views
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center text-gray-600">
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center text-gray-600">No campaigns found.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  userType={isCreator ? "creator" : "brand"}
                  onView={(c) => console.log("View campaign:", c)}
                  onContentSubmitted={handleContentSubmitted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
