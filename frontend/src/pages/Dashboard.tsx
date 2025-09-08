import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const creatorStats = [
    {
      title: "Available Contracts",
      value: "12",
      color: "blue",
      action: () => onNavigate("contracts"),
    },
    {
      title: "Active Campaigns",
      value: "3",
      color: "green",
      action: () => onNavigate("campaigns"),
    },
    {
      title: "Total Earned",
      value: "€245",
      color: "purple",
      action: () => onNavigate("earnings"),
    },
  ];

  const brandStats = [
    {
      title: "Active Contracts",
      value: "5",
      color: "blue",
      action: () => onNavigate("contracts"),
    },
    {
      title: "Total Creators",
      value: "28",
      color: "green",
      action: () => onNavigate("campaigns"),
    },
    {
      title: "Total Spend",
      value: "€1,250",
      color: "red",
      action: () => onNavigate("payouts"),
    },
  ];

  const stats = user?.user_type === "creator" ? creatorStats : brandStats;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.first_name}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
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
              className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-${stat.color}-500`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 truncate">
                      {stat.title}
                    </p>
                    <p
                      className={`text-3xl font-semibold text-${stat.color}-600 mt-2`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {user?.user_type === "creator"
                ? "Recent Opportunities"
                : "Recent Activity"}
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📄</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.user_type === "creator"
                        ? `New contract: Skincare product promotion`
                        : `Creator accepted: Fitness campaign`}
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
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
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {user?.user_type === "creator" ? (
                <>
                  <button
                    onClick={() => onNavigate("contracts")}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">🔍</span>
                      <div>
                        <p className="font-medium text-blue-900">
                          Browse Contracts
                        </p>
                        <p className="text-sm text-blue-600">
                          Find new opportunities
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigate("campaigns")}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-green-600 mr-3">📊</span>
                      <div>
                        <p className="font-medium text-green-900">
                          Track Campaigns
                        </p>
                        <p className="text-sm text-green-600">
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
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-3">➕</span>
                      <div>
                        <p className="font-medium text-blue-900">
                          Create Contract
                        </p>
                        <p className="text-sm text-blue-600">
                          Start a new campaign
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigate("campaigns")}
                    className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-purple-600 mr-3">📈</span>
                      <div>
                        <p className="font-medium text-purple-900">
                          View Analytics
                        </p>
                        <p className="text-sm text-purple-600">
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
