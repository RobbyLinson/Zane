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

  // Updated color scheme to match Dashboard
  const statusColors: Record<Campaign["status"], string> = {
    accepted: "bg-[var(--primary-500)] text-white",
    content_created: "bg-[var(--secondary-200)] text-[var(--primary-700)]",
    tracking: "bg-[var(--accent-500)] text-white",
    completed: "bg-[var(--success-500,#22c55e)] text-white",
    paid: "bg-[var(--background-600)] text-[var(--text-100)]",
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
    <div className="bg-[var(--background-700)] rounded-xl shadow-lg p-6 border border-[var(--background-600)] hover:shadow-xl transition-shadow flex flex-col justify-between min-h-[260px]">
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-100)] mb-1 truncate">
              {contract ? contract.title : "Loading..."}
            </h3>
            {userType === "brand" && campaign.creator && (
              <p className="text-xs text-[var(--text-300)]">
                Creator: {campaign.creator.first_name}{" "}
                {campaign.creator.last_name}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              statusColors[campaign.status] ||
              "bg-[var(--background-600)] text-[var(--text-100)]"
            }`}
          >
            {campaign.status.replace("_", " ")}
          </span>
        </div>

        {contract && contract.platform && (
          <div className="text-xs text-[var(--text-300)] mb-2 capitalize">
            Platform: {contract.platform}
          </div>
        )}

        <div className="mb-2">
          {userType === "creator" ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-300)]">
                  Views tracked
                </span>
                <span className="text-sm font-medium text-[var(--primary-500)]">
                  {campaign.views_tracked.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-300)]">
                  Amount earned
                </span>
                <span className="text-sm font-medium text-[var(--text-50)]">
                  €{campaign.amount_earned}
                </span>
              </div>
              {campaign.content_url ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-300)]">
                    Content
                  </span>
                  <a
                    href={campaign.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--secondary-500)] underline font-medium"
                  >
                    View
                  </a>
                </div>
              ) : (
                campaign.status === "accepted" && (
                  <div className="mt-2">
                    <button
                      className="text-[var(--primary-500)] underline text-sm mb-2 font-medium"
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
                          className="border px-2 py-1 rounded w-full mb-2 bg-[var(--background-600)] text-[var(--text-100)]"
                          disabled={submitting}
                        />
                        <button
                          type="submit"
                          className="bg-[var(--primary-500)] text-white px-3 py-1 rounded text-sm font-semibold shadow"
                          disabled={submitting}
                        >
                          {submitting ? "Submitting..." : "Submit"}
                        </button>
                        {error && (
                          <div className="text-red-500 text-xs mt-1">
                            {error}
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-300)]">Content</span>
                {campaign.content_url ? (
                  <a
                    href={campaign.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--primary-500)] underline font-medium"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-sm text-[var(--text-300)]">
                    Not submitted
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-300)]">Views</span>
                <span className="text-sm font-medium text-[var(--primary-500)]">
                  {campaign.views_tracked.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-300)]">Earned</span>
                <span className="text-sm font-medium text-[var(--accent-500)]">
                  €{campaign.amount_earned}
                </span>
              </div>
              {campaign.content_submitted_at && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-300)]">
                    Submitted
                  </span>
                  <span className="text-xs text-[var(--text-100)]">
                    {new Date(
                      campaign.content_submitted_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {onView && (
        <button
          onClick={() => onView(campaign)}
          className="mt-4 px-3 py-1 text-sm text-[var(--text-300)] hover:text-[var(--primary-500)] font-medium rounded"
        >
          View Details
        </button>
      )}
    </div>
  );
};
