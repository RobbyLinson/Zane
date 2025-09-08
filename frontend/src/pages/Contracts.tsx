import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { ContractCard } from "../components/contracts/ContractCard";
import { CreateContractForm } from "../components/contracts/CreateContractForm";
import type { Contract } from "../types";

export const Contracts: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({ platform: "", status: "" });

  const isCreator = user?.user_type === "creator";
  const isBrand = user?.user_type === "brand";

  const loadContracts = async () => {
    try {
      setLoading(true);
      const response = await api.getContracts(filters);
      setContracts(response.contracts);
    } catch (err) {
      console.error("Failed to load contracts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const response = await api.getContracts(filters);
        setContracts(response.contracts);
      } catch (err: unknown) {
        console.error("Failed to load contracts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [filters]);

  const handleAcceptContract = async (contractId: string) => {
    try {
      await api.acceptContract(contractId);
      // Remove from list for creators
      setContracts((prev) => prev.filter((c) => c.id !== contractId));
    } catch (err) {
      console.error("Failed to accept contract:", err);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadContracts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isCreator ? "Available Contracts" : "My Contracts"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isCreator
                  ? "Browse and accept contracts from brands"
                  : "Manage your brand contracts"}
              </p>
            </div>

            {isBrand && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Create Contract
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Platforms</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube_shorts">YouTube Shorts</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Contracts list */}
          {loading ? (
            <div className="text-center text-gray-600">
              Loading contracts...
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center text-gray-600">
              No contracts found. {isBrand && "Create one to get started!"}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  userType={isCreator ? "creator" : "brand"}
                  onAccept={isCreator ? handleAcceptContract : undefined}
                  onEdit={isBrand ? (c) => console.log("Edit:", c) : undefined}
                  onView={(c) => console.log("View:", c)}
                />
              ))}
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
