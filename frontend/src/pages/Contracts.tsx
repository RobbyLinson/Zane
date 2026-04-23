import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ContractCard } from "../components/contracts/ContractCard";
import { CreateContractForm } from "../components/contracts/CreateContractForm";
import type { Contract } from "../types";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export const Contracts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [recommended, setRecommended] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({ platform: "", status: "" });

  const isCreator = user?.user_type === "creator";
  const isBrand = user?.user_type === "brand";

  const recommendedIds = new Set(recommended.map((contract) => contract.id));
  const normalContracts = isCreator
    ? contracts.filter((contract) => !recommendedIds.has(contract.id))
    : contracts;
  const visibleContracts = isCreator
    ? [...recommended, ...normalContracts]
    : normalContracts;

  const debugLog = (...args: unknown[]) => {
    console.log("[Contracts]", ...args);
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      debugLog("loadContracts:start", {
        userId: user?.id,
        userType: user?.user_type,
        hasAboutMe: Boolean(user?.about_me),
        filters,
      });

      const [contractsRes, recommendedRes] = await Promise.all([
        api.getContracts(filters),
        isCreator && user?.about_me
          ? api.getRecommendedContracts().catch(() => ({ contracts: [] }))
          : Promise.resolve({ contracts: [] }),
      ]);

      debugLog("loadContracts:response", {
        contractsCount: contractsRes?.contracts?.length ?? 0,
        recommendedCount: recommendedRes?.contracts?.length ?? 0,
        contractsPreview: contractsRes?.contracts?.slice?.(0, 2),
      });

      setContracts(contractsRes.contracts);
      setRecommended(recommendedRes.contracts);
    } catch (err) {
      console.error("Failed to load contracts:", err);
      debugLog("loadContracts:error", err);
    } finally {
      setLoading(false);
      debugLog("loadContracts:done");
    }
  };

  useEffect(() => {
    debugLog("filters changed", filters);
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    debugLog("state snapshot", {
      loading,
      contractsCount: contracts.length,
      recommendedCount: recommended.length,
      isCreator,
      isBrand,
    });
  }, [loading, contracts.length, recommended.length, isCreator, isBrand]);

  const handleAcceptContract = async (contractId: string) => {
    try {
      await api.acceptContract(contractId);
      setContracts((prev) => prev.filter((c) => c.id !== contractId));
      setRecommended((prev) => prev.filter((c) => c.id !== contractId));
    } catch (err) {
      console.error("Failed to accept contract:", err);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadContracts();
  };

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)] p-4">
      <div className="w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-100)]">
                {isCreator ? "Available Contracts" : "My Contracts"}
              </h1>
              <p className="text-[var(--text-300)] mt-1">
                {isCreator
                  ? "Browse and accept contracts from brands"
                  : "Manage your brand contracts"}
              </p>
            </div>

            {isBrand && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="bg-[var(--primary-500)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-700)] flex items-center gap-2"
              >
                <AddCircleIcon fontSize="small" />
                Create Contract
              </button>
            )}
          </div>

          {/* ── Zane Recommendations (creators only) ─────────────────────────── */}

          {/* Filters */}
          <div className="bg-[var(--background-700)] p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                  Platform
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-600)]"
                >
                  <option value="">All Platforms</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube_shorts">YouTube Shorts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-600)]"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {isCreator && !user?.about_me && (
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 bg-[var(--background-700)] border border-[var(--secondary-200)]/40 hover:border-[var(--secondary-200)] rounded-lg px-5 py-4 mb-6 cursor-pointer transition group"
            >
              <InfoOutlinedIcon
                fontSize="small"
                style={{ color: "var(--secondary-200)" }}
                className="shrink-0"
              />
              <p className="text-sm text-[var(--text-200)] group-hover:text-[var(--text-100)] transition">
                <span className="font-semibold text-[var(--secondary-200)]">
                  Set up your profile
                </span>{" "}
                to unlock Zane Recommendations — contracts matched to your
                content style.
              </p>
              <span className="ml-auto text-xs text-[var(--secondary-200)] font-medium whitespace-nowrap">
                Go to Profile →
              </span>
            </div>
          )}

          {/* Contracts list */}
          {loading ? (
            <div className="text-center text-[var(--text-300)]">
              Loading contracts...
            </div>
          ) : visibleContracts.length === 0 ? (
            <div className="text-center text-[var(--text-300)]">
              No contracts found. {isBrand && "Create one to get started!"}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleContracts.map((contract) => {
                const isRecommended =
                  isCreator && recommendedIds.has(contract.id);

                if (isRecommended) {
                  return (
                    <div key={contract.id} className="relative">
                      <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 bg-[var(--secondary-200)] text-[var(--background-700)] text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        <AutoAwesomeIcon style={{ fontSize: 10 }} />
                        Zane Pick
                      </div>
                      <div className="rounded-xl border-2 border-[var(--secondary-200)] overflow-hidden">
                        <ContractCard
                          contract={contract}
                          userType="creator"
                          onAccept={handleAcceptContract}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    userType={isCreator ? "creator" : "brand"}
                    onAccept={isCreator ? handleAcceptContract : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateContractForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};
