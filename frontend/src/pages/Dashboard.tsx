import React from "react";
import { useAuth } from "../contexts/AuthContext";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CPM Tool</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.first_name}!
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {user?.user_type}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {user?.user_type === "creator"
                  ? "Creator Dashboard"
                  : "Brand Dashboard"}
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">
                    {user?.user_type === "creator"
                      ? "Available Contracts"
                      : "Active Contracts"}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900">
                    {user?.user_type === "creator"
                      ? "Total Earnings"
                      : "Total Spend"}
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">€0</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900">
                    {user?.user_type === "creator"
                      ? "Active Campaigns"
                      : "Pending Approval"}
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-gray-600">
                  {user?.user_type === "creator"
                    ? "Start by browsing available contracts and connecting your social media accounts."
                    : "Create your first contract to start working with creators."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
