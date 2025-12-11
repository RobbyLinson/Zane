import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "../../services/api";
import type { CreateContractData } from "../../types";
import PaidIcon from "@mui/icons-material/Paid";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import NotesIcon from "@mui/icons-material/Notes";
// import TrendingUpIcon from "@mui/icons-material/TrendingUp";
// import InstagramIcon from "@mui/icons-material/Instagram";
// import YouTubeIcon from "@mui/icons-material/YouTube";
// import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { FundContractForm } from "./FundContract";

const stripePromise = loadStripe(
  "pk_test_51S5Sp6DGlKLv8jZbbpa0BwpoyPfAYVgn0zjGzEDmlrRqBbiituzNro2xOtnx9z2RMqhRymUOzKZmsXyDhCOE8kNS00yYTnZgUO"
);

interface CreateContractFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateContractForm: React.FC<CreateContractFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateContractData>({
    title: "",
    description: "",
    cpm_rate: 5.0,
    max_payout: 4000.0,
    min_views: 1000,
    target_audience: "",
    content_requirements: "",
    platform: "tiktok",
    company_charge: 5000.0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cpm_rate" ||
        name === "max_payout" ||
        name === "min_views" ||
        name === "company_charge"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleBudgetChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      company_charge: value,
      max_payout: value * 0.8, // 80% goes to creator after 20% platform cut
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowFundModal(true);
    setLoading(false);
  };

  const handleFundSuccess = async () => {
    setLoading(true);
    try {
      await api.createContract(formData); // Only create after funding
      setShowFundModal(false);
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create contract"
      );
    } finally {
      setLoading(false);
    }
  };

  const maxViews =
    formData.cpm_rate > 0
      ? Math.floor((formData.max_payout / formData.cpm_rate) * 1000)
      : 0;
  const platformCut = formData.company_charge * 0.2;
  const creatorPayout = formData.company_charge * 0.8;

  //   const platformIcons = {
  //     tiktok: <MusicNoteIcon fontSize="medium" style={{ color: "#25F4EE" }} />,
  //     instagram: <InstagramIcon fontSize="medium" style={{ color: "#E1306C" }} />,
  //     youtube_shorts: (
  //       <YouTubeIcon fontSize="medium" style={{ color: "#FF0000" }} />
  //     ),
  //   };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal overlay for semi-transparent background */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] mx-auto rounded-2xl shadow-2xl overflow-y-auto border border-[var(--border-900)] bg-[var(--background-700)] bg-opacity-95 backdrop-blur-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary-700)] to-[var(--secondary-700)] p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-100)] flex items-center gap-2">
                <AssignmentIcon
                  fontSize="medium"
                  style={{ color: "var(--primary-500)" }}
                />
                Create Campaign Contract
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="text-[var(--text-100)] hover:text-[var(--secondary-200)] transition-colors text-2xl font-light"
            >
              ×
            </button>
          </div>
        </div>
        <form className="p-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">
              <div className="flex">
                <div className="text-red-500 mr-3">⚠️</div>
                <div>{error}</div>
              </div>
            </div>
          )}
          <div className="space-y-8">
            {/* Budget Section */}
            <div className="bg-gradient-to-br from-[var(--primary-800)] to-[var(--secondary-800)] p-4 rounded-xl border border-[var(--primary-900)]">
              <h3 className="text-lg font-semibold text-[var(--text-100)] mb-3 flex items-center gap-2">
                <PaidIcon
                  fontSize="small"
                  style={{ color: "var(--primary-500)" }}
                />
                Campaign Budget
              </h3>

              {/* Sliders side by side */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* CPM Rate Slider */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-200)] mb-2">
                    CPM Rate: €{formData.cpm_rate.toLocaleString()} / 1K views
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={formData.cpm_rate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cpm_rate: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-[var(--background-600)] rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                        ((formData.cpm_rate - 5) / 20) * 100
                      }%, #23272f ${
                        ((formData.cpm_rate - 5) / 20) * 100
                      }%, #23272f 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-300)] mt-1">
                    <span>€5</span>
                    <span>€25</span>
                  </div>
                </div>

                {/* Budget Slider */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-200)] mb-2">
                    Total Budget: €{formData.company_charge.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="500"
                    value={formData.company_charge}
                    onChange={(e) =>
                      handleBudgetChange(parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-[var(--background-600)] rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                        ((formData.company_charge - 5000) / 20000) * 100
                      }%, #23272f ${
                        ((formData.company_charge - 5000) / 20000) * 100
                      }%, #23272f 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-300)] mt-1">
                    <span>€5K</span>
                    <span>€25K</span>
                  </div>
                </div>
              </div>

              {/* Platform Fee, Creator Payout, Max Views */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <div className="text-xs text-[var(--text-300)] mb-1">
                    Platform Fee
                  </div>
                  <div className="text-base font-semibold text-[var(--text-100)]">
                    €{platformCut.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <div className="text-xs text-[var(--text-300)] mb-1">
                    Creator Payout
                  </div>
                  <div className="text-base font-semibold text-[var(--primary-500)]">
                    €{creatorPayout.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <div className="text-xs text-[var(--text-300)] mb-1">
                    Max Views
                  </div>
                  <div className="text-base font-semibold text-[var(--secondary-200)]">
                    {maxViews.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <label className="block text-xs text-[var(--text-300)] mb-1">
                    Min Views
                  </label>
                  <input
                    type="text"
                    name="min_views"
                    value={
                      formData.min_views
                        ? formData.min_views.toLocaleString()
                        : "1,000"
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || !isNaN(Number(value))) {
                        handleChange({
                          target: {
                            name: "min_views",
                            value: value,
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                    className="w-full text-base font-semibold text-[var(--secondary-200)] bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-0 mb-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent bg-[var(--background-600)] text-[var(--text-100)] text-sm"
                    placeholder="e.g., Summer Skincare Campaign"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                    Campaign Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent resize-none bg-[var(--background-600)] text-[var(--text-100)] text-sm"
                    placeholder="Describe your campaign goals and what you're looking for..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text-200)] mb-1 flex items-center gap-1">
                    <GroupIcon
                      fontSize="small"
                      style={{ color: "var(--secondary-200)" }}
                    />
                    Target Audience
                  </label>
                  <input
                    type="text"
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent bg-[var(--background-600)] text-[var(--text-100)] text-sm"
                    placeholder="e.g., Women 18-35, Fashion enthusiasts"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--text-200)] mb-1 flex items-center gap-1">
                    <NotesIcon
                      fontSize="small"
                      style={{ color: "var(--primary-500)" }}
                    />
                    Content Requirements
                  </label>
                  <textarea
                    name="content_requirements"
                    value={formData.content_requirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent resize-none bg-[var(--background-600)] text-[var(--text-100)] text-sm"
                    placeholder="Specific requirements, hashtags, mentions..."
                  />
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-900)] ">
              <div className="text-sm text-[var(--text-300)]">
                All amounts in EUR. Contract subject to platform terms.
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-[var(--text-300)] hover:text-[var(--text-100)] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-200)] text-white font-medium rounded-lg hover:from-[var(--primary-700)] hover:to-[var(--secondary-300)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <CampaignIcon fontSize="small" />
                      Creating...
                    </div>
                  ) : (
                    <>
                      <CampaignIcon fontSize="small" /> Launch Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
        {/* Fund Contract Modal - Separate from main modal */}
        {showFundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60]">
            <div className="bg-[var(--background-700)] rounded-lg p-8 shadow-lg max-w-2xl w-full mx-4 border border-[var(--border-900)]">
              <Elements stripe={stripePromise}>
                <FundContractForm
                  contractDraft={formData}
                  onSuccess={handleFundSuccess}
                  onCancel={() => setShowFundModal(false)}
                />
              </Elements>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateContractForm;

{
  /* <div>
                  <label className="block text-sm font-medium text-[var(--text-200)] mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(platformIcons).map(([platform, icon]) => (
                      <button
                        key={platform}
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                          formData.platform === platform
                            ? "bg-[var(--primary-500)] border-[var(--primary-700)] text-white"
                            : "bg-[var(--background-600)] border-[var(--border-900)] text-[var(--text-100)] hover:bg-[var(--primary-800)]"
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, platform }))
                        }
                      >
                        {icon}
                        <span className="text-xs mt-1 capitalize">
                          {platform.replace("_", " ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div> */
}
