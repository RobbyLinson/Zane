import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import PersonIcon from "@mui/icons-material/Person";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Creator fields
  const [aboutMe, setAboutMe] = useState(user?.about_me ?? "");

  // Brand fields
  const [companyName, setCompanyName] = useState(user?.company_name ?? "");

  const isCreator = user?.user_type === "creator";

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      if (isCreator) {
        await api.updateProfile({ about_me: aboutMe });
      } else {
        await api.updateProfile({ company_name: companyName });
      }
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[var(--background-700)] rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[var(--text-100)] flex items-center gap-2 mb-6">
          <PersonIcon style={{ color: "var(--primary-500)" }} />
          Profile
        </h1>

        {/* Read-only info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-[var(--text-300)] mb-1">Name</p>
            <p className="text-sm font-medium text-[var(--text-100)]">
              {user?.first_name} {user?.last_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-300)] mb-1">Email</p>
            <p className="text-sm font-medium text-[var(--text-100)]">
              {user?.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-300)] mb-1">Account Type</p>
            <p className="text-sm font-medium text-[var(--text-100)] capitalize">
              {user?.user_type}
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--border-900)] mb-6" />

        {isCreator ? (
          <>
            {/* About Me — required for recommendations */}
            {!user?.about_me && (
              <div className="flex items-start gap-2 bg-yellow-950/40 border border-yellow-500/40 text-yellow-400 px-4 py-3 rounded-lg text-sm mb-4">
                <InfoOutlinedIcon fontSize="small" className="mt-0.5 shrink-0" />
                <span>
                  Add your About Me to unlock{" "}
                  <span className="font-semibold">Zane Recommendations</span> —
                  contracts matched to your content style.
                </span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                About Me{" "}
                <span className="text-[var(--primary-500)]">
                  * required for Zane Recommendations
                </span>
              </label>
              <textarea
                rows={6}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Describe yourself, your content style, your audience, and the niches you create in. This is used to match you with brand contracts."
                className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none bg-[var(--background-600)] text-[var(--text-100)] text-sm"
              />
              <p className="text-xs text-[var(--text-300)] mt-1">
                {aboutMe.length} chars
              </p>
            </div>

            {/* TikTok connection status */}
            <div className="bg-[var(--background-600)] rounded-lg p-4 border border-[var(--border-900)] mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-200)]">
                <MusicNoteIcon fontSize="small" style={{ color: "#25F4EE" }} />
                TikTok Connection
              </div>
              <p className="text-xs text-[var(--text-300)] mt-1">
                Connect your TikTok account from the profile menu (top right) to
                enable view tracking and payouts.
              </p>
            </div>
          </>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company or brand name"
              className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] bg-[var(--background-600)] text-[var(--text-100)] text-sm"
            />
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-200)] hover:from-[var(--primary-700)] hover:to-[var(--secondary-300)] transition disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};
