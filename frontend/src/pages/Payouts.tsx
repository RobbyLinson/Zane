import React, { useState, useEffect } from "react";
import { api } from "../services/api";

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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payouts</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Maximum Possible Earnings:</span>
          <span className="text-lg font-semibold text-green-700">
            ${maxPayout.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Currently Available:</span>
          <span className="text-lg font-semibold text-blue-700">
            ${currentPayout.toFixed(2)}
          </span>
        </div>
        <button
          className={`w-full py-2 mt-4 rounded text-white font-semibold transition ${
            currentPayout > 0 && !withdrawn
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
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
      <p className="text-gray-500 text-sm">
        Your available balance is based on your campaign performance.
        Withdrawals are processed instantly.
      </p>
    </div>
  );
};
