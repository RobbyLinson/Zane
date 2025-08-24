import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Zane</h1>
        <p className="text-gray-600">Creator & Brand Marketplace</p>
        <div className="mt-4 space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Creator Login
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Brand Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
