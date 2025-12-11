import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CampaignIcon from "@mui/icons-material/Campaign";
import PaidIcon from "@mui/icons-material/Paid";
import BarChartIcon from "@mui/icons-material/BarChart";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { Campaign } from "../types";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [numContracts, setNumContracts] = React.useState<number>(0);
  const [numCampaigns, setNumCampaigns] = React.useState<number>(0);
  const [currentPayout, setCurrentPayout] = React.useState<number>(0);
  const [numBrandCampaigns, setNumBrandCampaigns] = React.useState<number>(0);
  const [brandPayout, setBrandPayout] = React.useState<number>(0);
  const [brandCampaigns, setBrandCampaigns] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchNumContracts = async () => {
      try {
        const data = await api.getNumAvailableContracts();
        setNumContracts(data.count || 0);
      } catch (err) {
        setNumContracts(0);
        console.error("Failed to load number of contracts:", err);
      }
    };
    fetchNumContracts();
  }, []);

  React.useEffect(() => {
    const fetchNumCampaigns = async () => {
      try {
        if (user) {
          const data = await api.getCampaignCountByUser(user.id);
          setNumCampaigns(data.count || 0);
        }
      } catch (err) {
        setNumCampaigns(0);
        console.error("Failed to load number of campaigns:", err);
      }
    };
    const fetchCurrentPayout = async () => {
      try {
        const response = await api.getCurrentPayout();
        setCurrentPayout(response.totalCurrentPayout || 0);
      } catch (err) {
        setCurrentPayout(0);
        console.error("Failed to load max payout:", err);
      }
    };
    fetchNumCampaigns();
    fetchCurrentPayout();
  }, [user]);

  React.useEffect(() => {
    const fetchNumBrandCampaigns = async () => {
      try {
        const data = await api.getBrandCampaigns();
        const campaigns = data.campaigns || [];
        setNumBrandCampaigns(campaigns.length);
        setBrandCampaigns(campaigns);
        // Calculate total spend (sum amount_earned from each campaign's contract)
        const totalSpend = campaigns.reduce(
          (sum: number, campaign: Campaign) => {
            // Some campaigns may not have contract populated, so check
            if (campaign && campaign.amount_earned) {
              console.log("amount_earned:", campaign.amount_earned);
              return sum + campaign.amount_earned;
            }
            return sum;
          },
          0
        );
        setBrandPayout(totalSpend);
      } catch (err) {
        setNumBrandCampaigns(0);
        setBrandPayout(0);
        setBrandCampaigns([]);
        console.error("Failed to load number of brand campaigns:", err);
      }
    };
    if (user?.user_type === "brand") {
      fetchNumBrandCampaigns();
      // console.log("Fetched brand campaigns: ", numBrandCampaigns);
    }
  }, [user]);

  const creatorStats = [
    {
      title: "Available Contracts",
      value: numContracts !== null ? numContracts.toString() : "...",
      color: "var(--primary-500)",
      icon: (
        <AssignmentIcon
          fontSize="medium"
          style={{ color: "var(--primary-500)" }}
        />
      ),
      action: () => onNavigate("contracts"),
    },
    {
      title: "Active Campaigns",
      value: numCampaigns !== null ? numCampaigns.toString() : "...",
      color: "var(--secondary-200)",
      icon: (
        <CampaignIcon
          fontSize="medium"
          style={{ color: "var(--secondary-200)" }}
        />
      ),
      action: () => onNavigate("campaigns"),
    },
    {
      title: "Total Earned",
      value: `€${currentPayout.toFixed(2)}`,
      color: "var(--text-50)",
      icon: <PaidIcon fontSize="medium" style={{ color: "var(--text-50)" }} />,
      action: () => onNavigate("earnings"),
    },
  ];

  const brandStats = [
    {
      title: "Active Contracts",
      value: numContracts !== null ? numContracts.toString() : "...",
      color: "var(--primary-500)",
      icon: (
        <AssignmentIcon
          fontSize="medium"
          style={{ color: "var(--primary-500)" }}
        />
      ),
      action: () => onNavigate("contracts"),
    },
    {
      title: "Total Campaigns",
      value: numBrandCampaigns !== null ? numBrandCampaigns.toString() : "...",
      color: "var(--secondary-200)",
      icon: (
        <CampaignIcon
          fontSize="medium"
          style={{ color: "var(--secondary-200)" }}
        />
      ),
      action: () => onNavigate("campaigns"),
    },
    {
      title: "Total Spend",
      value: `€${brandPayout.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      color: "var(--text-50)",
      icon: (
        <CreditCardIcon fontSize="medium" style={{ color: "var(--text-50)" }} />
      ),
      action: () => onNavigate("payouts"),
    },
  ];

  const stats = user?.user_type === "creator" ? creatorStats : brandStats;

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)]">
      <div className="w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-[var(--text-100)]">
            Welcome back {user?.first_name}!
          </h2>
          <p className="text-[var(--text-300)] mt-1">
            {user?.user_type === "creator"
              ? "Ready to find your next campaign?"
              : "Here's how your campaigns are performing."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={stat.action}
              className="bg-[var(--background-700)] overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow border-l-4"
              style={{ borderLeftColor: stat.color }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-3">{stat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-300)] truncate">
                        {stat.title}
                      </p>
                      <p
                        className="text-3xl font-semibold mt-2"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--background-700)] shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-[var(--text-100)] mb-4">
              {user?.user_type === "creator"
                ? "Recent Opportunities"
                : "Recent Activity"}
            </h3>
            {/* <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-3 bg-[var(--background-600)] rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[var(--primary-500)] rounded-full flex items-center justify-center">
                      <DashboardIcon
                        fontSize="small"
                        style={{ color: "#fff" }}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-100)]">
                      {user?.user_type === "creator"
                        ? `New contract: Skincare product promotion`
                        : `Creator accepted: Fitness campaign`}
                    </p>
                    <p className="text-xs text-[var(--text-300)]">
                      2 hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                onNavigate(
                  user?.user_type === "creator" ? "contracts" : "campaigns"
                )
              }
              className="mt-4 text-sm text-[var(--secondary-200)] hover:text-[var(--primary-500)] font-medium"
            >
              View all →
            </button> */}
          </div>

          <div className="bg-[var(--background-700)] shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-[var(--text-100)] mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {user?.user_type === "creator" ? (
                <>
                  <button
                    onClick={() => onNavigate("contracts")}
                    className="w-full text-left p-3 bg-[var(--background-600)] hover:bg-[var(--background-700)] rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">
                        <SearchIcon
                          fontSize="small"
                          style={{ color: "var(--primary-500)" }}
                        />
                      </span>
                      <div>
                        <p className="font-medium text-[var(--primary-500)]">
                          Browse Contracts
                        </p>
                        <p className="text-sm text-[var(--text-300)]">
                          Find new opportunities
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigate("campaigns")}
                    className="w-full text-left p-3 bg-[var(--background-600)] hover:bg-[var(--background-700)] rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">
                        <CampaignIcon
                          fontSize="small"
                          style={{ color: "var(--secondary-200)" }}
                        />
                      </span>
                      <div>
                        <p className="font-medium text-[var(--secondary-200)]">
                          Track Campaigns
                        </p>
                        <p className="text-sm text-[var(--text-300)]">
                          Monitor your progress
                        </p>
                      </div>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate("contracts")}
                    className="w-full text-left p-3 bg-[var(--background-600)] hover:bg-[var(--background-700)] rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">
                        <AddCircleIcon
                          fontSize="small"
                          style={{ color: "var(--primary-500)" }}
                        />
                      </span>
                      <div>
                        <p className="font-medium text-[var(--primary-500)]">
                          Create Contract
                        </p>
                        <p className="text-sm text-[var(--text-300)]">
                          Start a new campaign
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigate("campaigns")}
                    className="w-full text-left p-3 bg-[var(--background-600)] hover:bg-[var(--background-700)] rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">
                        <BarChartIcon
                          fontSize="small"
                          style={{ color: "var(--text-50)" }}
                        />
                      </span>
                      <div>
                        <p className="font-medium text-[var(--text-50)]">
                          View Analytics
                        </p>
                        <p className="text-sm text-[var(--text-300)]">
                          Track performance
                        </p>
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
