import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [verifyingTikTok, setVerifyingTikTok] = useState(false);
  const [tiktokVerified, setTikTokVerified] = useState<boolean | null>(null);

  // --- Stripe onboarding check ---
  useEffect(() => {
    const checkStripe = async () => {
      if (!user || user.user_type !== "creator") return;

      setLoadingStripe(true);
      try {
        const response = await api.getStripeOnboardingLink();
        console.log("Stripe API Response:", response);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStripeClick = () => {
    if (stripeUrl) window.location.href = stripeUrl;
    setIsDropdownOpen(false);
  };

  const handleViewDetails = () => {
    // Placeholder function - doesn't do anything yet
    console.log("View Details clicked");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleVerifyTikTok = async () => {
    setVerifyingTikTok(true);
    setTikTokVerified(null);
    try {
      // 1. Get TikTok OAuth URL from backend
      const response = await api.authenticateTiktokAccount();
      if (response.authUrl) {
        // 2. Redirect user to TikTok OAuth
        window.location.href = response.authUrl;
      } else {
        alert("Failed to get TikTok auth URL.");
        setVerifyingTikTok(false);
      }
    } catch (err) {
      setTikTokVerified(false);
      alert(`TikTok verification failed: ${err}`);
      setVerifyingTikTok(false);
    }
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

              <div className="flex items-center space-x-2">
                {/* Error icon for unregistered Stripe */}
                {stripeUrl && (
                  <div className="relative group">
                    <div
                      className="w-5 h-5 flex items-center justify-center text-yellow-500 text-lg cursor-help"
                      onClick={handleStripeClick}
                    >
                      ⚠️
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Stripe registration required
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-l-transparent border-r-transparent border-b-gray-800"></div>
                    </div>
                  </div>
                )}
                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      user?.user_type === "creator"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  >
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <button
                          onClick={handleViewDetails}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          View Details
                        </button>

                        {user?.user_type === "creator" && (
                          <button
                            onClick={handleVerifyTikTok}
                            disabled={verifyingTikTok}
                            className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 disabled:opacity-50"
                          >
                            {verifyingTikTok ? "Verifying..." : "Verify TikTok"}
                          </button>
                        )}

                        {stripeUrl && (
                          <button
                            onClick={handleStripeClick}
                            disabled={loadingStripe}
                            className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 hover:text-yellow-900 disabled:opacity-50"
                          >
                            {loadingStripe ? "Loading..." : "Register Stripe"}
                          </button>
                        )}

                        <div className="border-t border-gray-100"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
