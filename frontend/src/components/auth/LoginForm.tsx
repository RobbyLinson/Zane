import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background-700)] p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-[var(--text-100)] text-center">
        Welcome Back to <span className="text-[var(--primary-500)]">Zane</span>
      </h2>
      <h3 className="text-ld font-semibold text-[var(--text-200)] mb-6 text-center">
        What're you promoting today?
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary-500)] text-white py-2 px-4 rounded-md hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-300)] mt-4">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-[var(--secondary-200)] hover:text-blue-600 font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};
