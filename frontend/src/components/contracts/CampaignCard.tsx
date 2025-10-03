import React, { useEffect, useState } from "react";
import type { Campaign, Contract } from "../../types";
import { api } from "../../services/api";

interface CampaignCardProps {
  campaign: Campaign;
  userType: "creator" | "brand";
  onView?: (campaign: Campaign) => void;
  onContentSubmitted?: () => void; // Add this prop to notify parent to refresh
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  userType,
  onView,
  onContentSubmitted,
}) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [showContentForm, setShowContentForm] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await api.getContract(campaign.contract_id);
        setContract(res.contract);
      } catch (err) {
        setContract(null);
        console.error("Failed to fetch contract", err);
      }
    };
    fetchContract();
  }, [campaign.contract_id]);

  const statusColors: Record<Campaign["status"], string> = {
    accepted: "bg-blue-100 text-blue-800",
    content_created: "bg-yellow-100 text-yellow-800",
    tracking: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    paid: "bg-gray-100 text-gray-800",
  };

  // Submit TikTok content handler
  const handleSubmitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.submitTikTokContent(campaign.id, tiktokUrl);
      setShowContentForm(false);
      setTiktokUrl("");
      if (onContentSubmitted) onContentSubmitted();
    } catch (err: any) {
      setError(err.message || "Failed to submit TikTok content.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {contract ? contract.title : "Loading..."}
          </h3>
          {userType === "brand" && campaign.creator && (
            <p className="text-sm text-gray-600">
              Creator: {campaign.creator.first_name}{" "}
              {campaign.creator.last_name}
            </p>
          )}
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            statusColors[campaign.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {campaign.status.replace("_", " ")}
        </span>
      </div>

      {contract && contract.platform && (
        <div className="text-xs text-gray-500 mb-2 capitalize">
          Platform: {contract.platform}
        </div>
      )}

      <div className="mb-2">
        {userType === "creator" ? (
          <>
            <p className="text-sm text-gray-700">
              Views tracked: {campaign.views_tracked.toLocaleString()}
            </p>
            <p className="text-sm text-gray-700">
              Amount earned: €{campaign.amount_earned}
            </p>
            {campaign.content_url ? (
              <p className="text-sm text-gray-700">
                Content URL:{" "}
                <a
                  href={campaign.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Content
                </a>
              </p>
            ) : (
              // Show submit TikTok content form if not submitted
              campaign.status === "accepted" && (
                <>
                  <button
                    className="text-blue-600 underline text-sm mb-2"
                    onClick={() => setShowContentForm((v) => !v)}
                  >
                    {showContentForm ? "Cancel" : "Submit TikTok Content"}
                  </button>
                  {showContentForm && (
                    <form onSubmit={handleSubmitContent} className="mt-2">
                      <input
                        type="url"
                        required
                        placeholder="Paste your TikTok video URL"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        className="border px-2 py-1 rounded w-full mb-2"
                        disabled={submitting}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit"}
                      </button>
                      {error && (
                        <div className="text-red-500 text-xs mt-1">{error}</div>
                      )}
                    </form>
                  )}
                </>
              )
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700">
              Content URL:{" "}
              {campaign.content_url ? (
                <a
                  href={campaign.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Content
                </a>
              ) : (
                "Not submitted"
              )}
            </p>
            <p className="text-sm text-gray-700">
              Views: {campaign.views_tracked.toLocaleString()}
            </p>
            <p className="text-sm text-gray-700">
              Earned: €{campaign.amount_earned}
            </p>
            {campaign.content_submitted_at && (
              <p className="text-xs text-gray-500">
                Submitted:{" "}
                {new Date(campaign.content_submitted_at).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </div>

      {onView && (
        <button
          onClick={() => onView(campaign)}
          className="mt-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          View Details
        </button>
      )}
    </div>
  );
};
