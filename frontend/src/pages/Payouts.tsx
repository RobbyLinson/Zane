import React, { useState } from "react";

export const Payouts: React.FC = () => {
  // Mock data; replace with real API data in production
  const [maxPayout] = useState(1200.0); // Maximum possible earnings
  const [currentEarnings, setCurrentEarnings] = useState(450.0); // Already earned
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    // Simulate API call
    setTimeout(() => {
      setWithdrawn(true);
      setIsWithdrawing(false);
      setCurrentEarnings(0);
    }, 1500);
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
            ${currentEarnings.toFixed(2)}
          </span>
        </div>
        <button
          className={`w-full py-2 mt-4 rounded text-white font-semibold transition ${
            currentEarnings > 0 && !withdrawn
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={currentEarnings === 0 || isWithdrawing || withdrawn}
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
