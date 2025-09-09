import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api"; // your API helper

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(false);

  // --- Stripe onboarding check ---
  useEffect(() => {
    const checkStripe = async () => {
      if (!user || user.user_type !== "creator") return;

      setLoadingStripe(true);
      try {
        const response = await api.getStripeOnboardingLink(); // no params
        if (response.url) {
          setStripeUrl(response.url);
        } else {
          setStripeUrl(null);
        }
      } catch (err) {
        console.error("Stripe check failed:", err);
      } finally {
        setLoadingStripe(false);
      }
    };

    checkStripe();
  }, [user]);

  const handleStripeClick = () => {
    if (stripeUrl) window.location.href = stripeUrl;
  };

  const navItems =
    user?.user_type === "creator"
      ? [
          { id: "dashboard", name: "Dashboard", icon: "📊" },
          { id: "contracts", name: "Browse Contracts", icon: "📝" },
          { id: "campaigns", name: "My Campaigns", icon: "🎯" },
          { id: "earnings", name: "Earnings", icon: "💰" },
        ]
      : [
          { id: "dashboard", name: "Dashboard", icon: "📊" },
          { id: "contracts", name: "My Contracts", icon: "📝" },
          { id: "campaigns", name: "Analytics", icon: "📈" },
          { id: "payouts", name: "Payouts", icon: "💳" },
        ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Zane</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    currentPage === item.id
                      ? "border-b-2 border-blue-500 text-gray-900"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.user_type}
                </p>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  user?.user_type === "creator" ? "bg-blue-500" : "bg-green-500"
                }`}
              >
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </div>
            </div>

            {/* --- Stripe Registration Button --- */}
            {stripeUrl && (
              <button
                onClick={handleStripeClick}
                disabled={loadingStripe}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
              >
                {loadingStripe ? "Loading..." : "Stripe registration required"}
              </button>
            )}

            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto py-2 px-4 space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`whitespace-nowrap flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === item.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
