import React, { useState } from "react";
import { api } from "../../services/api";
import type { CreateContractData } from "../../types";

interface CreateContractFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

async function fundContract(contractId: string) {
  const response = await fetch(`/api/payments/fund/${contractId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  return data;
}

export const CreateContractForm: React.FC<CreateContractFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateContractData>({
    title: "",
    description: "",
    cpm_rate: 5.0,
    max_payout: 400.0,
    min_views: 1000,
    target_audience: "",
    content_requirements: "",
    platform: "tiktok",
    company_charge: 500.0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    try {
      await api.createContract(formData);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create contract");
      }
    } finally {
      setLoading(false);
    }
  };

  const maxViews = Math.floor((formData.max_payout / formData.cpm_rate) * 1000);
  const platformCut = formData.company_charge * 0.2;
  const creatorPayout = formData.company_charge * 0.8;

  const platformIcons = {
    tiktok: "🎵",
    instagram: "📸",
    youtube_shorts: "📺",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create Campaign Contract
              </h2>
              <p className="text-blue-100 mt-1">
                Set your budget and requirements
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:text-gray-200 transition-colors text-2xl font-light"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8">
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
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                💰 Campaign Budget
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Total Budget: €{formData.company_charge.toLocaleString()}
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="5000"
                      max="25000"
                      step="500"
                      value={formData.company_charge}
                      onChange={(e) =>
                        handleBudgetChange(parseInt(e.target.value))
                      }
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                          ((formData.company_charge - 5000) / 20000) * 100
                        }%, #e5e7eb ${
                          ((formData.company_charge - 5000) / 20000) * 100
                        }%, #e5e7eb 100%)`,
                      }}
                    />
                    <style>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        height: 24px;
                        width: 24px;
                        border-radius: 50%;
                        background: #10b981;
                        cursor: pointer;
                        border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                      }

                      input[type="range"]::-moz-range-thumb {
                        height: 24px;
                        width: 24px;
                        border-radius: 50%;
                        background: #10b981;
                        cursor: pointer;
                        border: 3px solid white;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                        border: none;
                      }
                    `}</style>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>€5,000</span>
                      <span>€25,000</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      Platform Fee (20%)
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      €{platformCut.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      Creator Payout (80%)
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      €{creatorPayout.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Summer Skincare Campaign"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(platformIcons).map(([platform, icon]) => (
                      <label key={platform} className="cursor-pointer">
                        <input
                          type="radio"
                          name="platform"
                          value={platform}
                          checked={formData.platform === platform}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            formData.platform === platform
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">{icon}</div>
                          <div className="text-xs capitalize">
                            {platform.replace("_", " ")}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your campaign goals and what you're looking for..."
                />
              </div>
            </div>

            {/* Performance Settings */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📊 Performance & Requirements
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPM Rate (€) *
                  </label>
                  <input
                    type="number"
                    name="cpm_rate"
                    value={formData.cpm_rate}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Per 1,000 views</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Creator Payout (€)
                  </label>
                  <input
                    type="number"
                    name="max_payout"
                    value={formData.max_payout}
                    onChange={handleChange}
                    step="0.01"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated (80% of budget)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Views
                  </label>
                  <input
                    type="number"
                    name="min_views"
                    value={formData.min_views}
                    onChange={handleChange}
                    min="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              {formData.cpm_rate > 0 && formData.max_payout > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Maximum Views Paid: {maxViews.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Creator earns €{formData.cpm_rate}/1K views, up to €
                        {formData.max_payout}
                      </p>
                    </div>
                    <div className="text-2xl">📈</div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Target Audience
                </label>
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Women 18-35, Fashion enthusiasts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Content Requirements
                </label>
                <textarea
                  name="content_requirements"
                  value={formData.content_requirements}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Specific requirements, hashtags, mentions..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                All amounts are in EUR. Contract is subject to platform terms.
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "🚀 Launch Campaign"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContractForm;
