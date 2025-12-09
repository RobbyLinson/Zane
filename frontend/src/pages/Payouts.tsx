import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import PaidIcon from "@mui/icons-material/Paid";
import CreditCardIcon from "@mui/icons-material/CreditCard";

export const Payouts: React.FC = () => {
  const [maxPayout, setMaxPayout] = useState<number>(0);
  const [currentPayout, setCurrentPayout] = useState<number>(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  // Replace this with your actual user ID logic
  const userId = localStorage.getItem("userId") || "currentUserId";

  useEffect(() => {
    const fetchMaxPayout = async () => {
      try {
        const response = await api.getMaxPayout();
        setMaxPayout(response.totalMaxPayout || 0);
      } catch (err) {
        setMaxPayout(0);
        console.error("Failed to load max payout:", err);
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
    fetchMaxPayout();
    fetchCurrentPayout();
  }, [userId, withdrawn]);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await api.withdrawUserBalance(currentPayout);
      setCurrentPayout(0);
      setWithdrawn(true);
    } catch (err) {
      console.error("Withdrawal failed:", err);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)] flex items-center justify-center">
      <div className="p-8 max-w-xl w-full mx-auto bg-[var(--background-700)] rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-8 text-[var(--text-100)] flex items-center">
          <PaidIcon className="mr-2" style={{ color: "var(--accent-500)" }} />
          Payouts
        </h1>
        <div className="bg-[var(--background-600)] rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="flex items-center text-[var(--text-300)]">
              <PaidIcon
                className="mr-2"
                style={{ color: "var(--accent-500)" }}
              />
              Maximum Possible Earnings
            </span>
            <span className="text-xl font-semibold text-[var(--text-50)]">
              €{maxPayout.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="flex items-center text-[var(--text-300)]">
              <CreditCardIcon
                className="mr-2"
                style={{ color: "var(--primary-500)" }}
              />
              Currently Available
            </span>
            <span className="text-xl font-semibold text-[var(--primary-500)]">
              €{currentPayout.toFixed(2)}
            </span>
          </div>
          <button
            className={`w-full py-2 mt-4 rounded font-semibold transition shadow text-white ${
              currentPayout > 0 && !withdrawn
                ? "bg-[var(--primary-500)] hover:bg-[var(--primary-700)]"
                : "bg-[var(--background-600)] cursor-not-allowed text-[var(--text-300)]"
            }`}
            disabled={currentPayout === 0 || isWithdrawing || withdrawn}
            onClick={handleWithdraw}
          >
            {isWithdrawing
              ? "Transferring..."
              : withdrawn
              ? "Transferred!"
              : "Withdraw to My Account"}
          </button>
        </div>
        <p className="text-[var(--text-300)] text-sm text-center">
          Your available balance is based on your campaign performance.
          <br />
          Withdrawals are processed instantly.
        </p>
      </div>
    </div>
  );
};
