import React, { useEffect, useState, useRef } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CampaignIcon from "@mui/icons-material/Campaign";
import PaidIcon from "@mui/icons-material/Paid";
import BarChartIcon from "@mui/icons-material/BarChart";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    navigate("/auth");
  };

  const handleVerifyTikTok = async () => {
    setVerifyingTikTok(true);
    try {
      const response = await api.authenticateTiktokAccount();
      if (response.authUrl) {
        // Store the current URL to return to after auth
        localStorage.setItem("tiktokAuthReturn", window.location.href);
        window.location.href = response.authUrl;
      }
    } catch (error) {
      console.error("TikTok verification failed:", error);
      setTikTokVerified(false);
    } finally {
      setVerifyingTikTok(false);
    }
  };
  const navItems =
    user?.user_type === "creator"
      ? [
          {
            id: "dashboard",
            name: "Dashboard",
            icon: <DashboardIcon fontSize="small" />,
            path: "/dashboard",
          },
          {
            id: "contracts",
            name: "Browse Contracts",
            icon: <AssignmentIcon fontSize="small" />,
            path: "/contracts",
          },
          {
            id: "campaigns",
            name: "My Campaigns",
            icon: <CampaignIcon fontSize="small" />,
            path: "/campaigns",
          },
          {
            id: "earnings",
            name: "Earnings",
            icon: <PaidIcon fontSize="small" />,
            path: "/earnings",
          },
        ]
      : [
          {
            id: "dashboard",
            name: "Dashboard",
            icon: <DashboardIcon fontSize="small" />,
            path: "/dashboard",
          },
          {
            id: "contracts",
            name: "My Contracts",
            icon: <AssignmentIcon fontSize="small" />,
            path: "/contracts",
          },
          {
            id: "campaigns",
            name: "Analytics",
            icon: <BarChartIcon fontSize="small" />,
            path: "/campaigns",
          },
          {
            id: "payouts",
            name: "Payouts",
            icon: <CreditCardIcon fontSize="small" />,
            path: "/payouts",
          },
        ];

  return (
    <nav className="bg-[var(--background-700)] shadow-lg border-b border-[var(--border-900)] fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-[var(--primary-500)]">
                Zane
              </h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "border-b-2 border-[var(--secondary-200)] text-[var(--text-100)]"
                        : "text-[var(--text-300)] hover:text-[var(--secondary-200)] hover:border-[var(--border-700)] border-b-2 border-transparent"
                    }`
                  }
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--text-100)]">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-[var(--text-300)] capitalize">
                  {user?.user_type}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Error icon for unregistered Stripe */}
                {stripeUrl && (
                  <div className="relative group">
                    <div
                      className="w-5 h-5 flex items-center justify-center text-yellow-400 text-lg cursor-help"
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium hover:ring-2 hover:ring-offset-2 hover:ring-[var(--secondary-200)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--secondary-200)] ${
                      user?.user_type === "creator"
                        ? "bg-[var(--primary-500)]"
                        : "bg-[var(--secondary-200)]"
                    }`}
                  >
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </button>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--background-700)] ring-1 ring-[var(--border-900)] ring-opacity-80 focus:outline-none z-50">
                      <div className="py-1">
                        <button
                          onClick={handleViewDetails}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--text-200)] hover:bg-[var(--background-600)] hover:text-[var(--text-100)]"
                        >
                          View Details
                        </button>

                        {user?.user_type === "creator" && !tiktokVerified && (
                          <button
                            onClick={handleVerifyTikTok}
                            disabled={verifyingTikTok}
                            className="w-full text-left px-4 py-2 text-sm text-[var(--secondary-200)] hover:bg-[var(--background-600)] hover:text-[var(--primary-500)] disabled:opacity-50"
                          >
                            {verifyingTikTok ? "Verifying..." : "Verify TikTok"}
                          </button>
                        )}

                        {stripeUrl && (
                          <button
                            onClick={handleStripeClick}
                            disabled={loadingStripe}
                            className="w-full text-left px-4 py-2 text-sm text-yellow-500 hover:bg-yellow-100 hover:text-yellow-900 disabled:opacity-50"
                          >
                            {loadingStripe ? "Loading..." : "Register Stripe"}
                          </button>
                        )}

                        <div className="border-t border-[var(--border-900)]"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-100 hover:text-red-900"
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
      <div className="md:hidden border-t border-[var(--border-900)]">
        <div
          className="flex overflow-x-auto px-4 space-x-1"
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `whitespace-nowrap flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--primary-500)] text-white"
                    : "text-[var(--text-300)] hover:text-[var(--secondary-200)] hover:bg-[var(--background-600)]"
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
