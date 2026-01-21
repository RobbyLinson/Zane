import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Add this import
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterData } from "../../types";
import { Link } from "react-router-dom";

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    user_type: "creator",
    first_name: "",
    last_name: "",
    company_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const { register } = useAuth();

  useEffect(() => {
    const errors: string[] = [];
    const { password, first_name, last_name } = formData;

    if (password.length < 8) {
      errors.push("Password must be longer than 8 characters.");
    }
    if (
      first_name &&
      password.toLowerCase().includes(first_name.toLowerCase())
    ) {
      errors.push("Password should not contain your first name.");
    }
    if (last_name && password.toLowerCase().includes(last_name.toLowerCase())) {
      errors.push("Password should not contain your last name.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include a capital letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must include a number.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must include a special character.");
    }
    if (password.toLowerCase().includes("password")) {
      errors.push('Password should not include the word "password".');
    }
    setPasswordErrors(errors);
  }, [formData, formData.password, formData.first_name, formData.last_name]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await register(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create contract");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background-700)] p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-[var(--text-100)] text-center">
        Sign Up for <span className="text-[var(--primary-500)]">Zane</span>
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
            I am a...
          </label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
          >
            <option value="creator">Creator</option>
            <option value="brand">Brand</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
              required
            />
          </div>
        </div>

        {formData.user_type === "brand" && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
            required
            minLength={6}
          />
          <AnimatePresence>
            {formData.password && passwordErrors.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-sm text-red-500 space-y-1"
              >
                {passwordErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {formData.password && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border-900)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--secondary-200)] text-[var(--text-100)] bg-[var(--background-800)]"
                required
                minLength={6}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary-500)] text-white py-2 px-4 rounded-md hover:bg-[var(--primary-700)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-300)] mt-4">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-[var(--secondary-200)] hover:text-blue-600 font-medium"
        >
          Login
        </Link>
      </p>
    </div>
  );
};
