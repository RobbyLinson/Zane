import React from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { Contracts } from "./pages/Contracts";
import { Campaigns } from "./pages/Campaigns";
import { Payouts } from "./pages/Payouts";
import { Navigation } from "./components/layout/Navigation";
import { Landing } from "./pages/Landing";

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user)
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  return <Outlet />;
};

const PrivateLayout: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <Navigation />
    <main>
      <Outlet />
    </main>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public landing (no auth, no nav) */}
      <Route path="/" element={<Landing />} />

      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      <Route element={<RequireAuth />}>
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/earnings" element={<Payouts />} />
          <Route path="/payouts" element={<Payouts />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

export default App;
