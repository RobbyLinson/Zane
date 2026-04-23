import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import PersonIcon from "@mui/icons-material/Person";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [aboutMe, setAboutMe] = useState(user?.about_me ?? "");
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

  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join("");

  return (
    <div className="mt-12 min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)] p-6">
      <div className="w-full max-w-2xl mx-auto space-y-4">

        {/* Identity card */}
        <div className="bg-[var(--background-700)] rounded-xl shadow-lg p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md select-none">
            {initials || <PersonIcon fontSize="large" />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-[var(--text-100)] leading-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-sm text-[var(--text-300)] mt-0.5 truncate">
              {user?.email}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-[var(--primary-500)]/20 text-[var(--primary-300)] border border-[var(--primary-500)]/30">
              {user?.user_type}
            </span>
          </div>
        </div>

        {/* Settings card */}
        <div className="bg-[var(--background-700)] rounded-xl shadow-lg p-6">
          <h2 className="text-base font-semibold text-[var(--text-100)] mb-4 flex items-center gap-2">
            <PersonIcon
              fontSize="small"
              style={{ color: "var(--primary-500)" }}
            />
            Profile Settings
          </h2>
          <div className="border-t border-[var(--border-900)] mb-5" />

          {isCreator ? (
            <>
              {!user?.about_me && (
                <div className="flex items-start gap-3 bg-[var(--warning-900)]/40 border border-[var(--warning-600)]/40 text-[var(--warning-300)] px-4 py-3 rounded-lg text-sm mb-5">
                  <InfoOutlinedIcon
                    fontSize="small"
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--warning-400)" }}
                  />
                  <span>
                    Add your About Me to unlock{" "}
                    <span className="font-semibold text-[var(--warning-200)]">
                      Zane Recommendations
                    </span>{" "}
                    — contracts matched to your content style.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-200)] mb-1.5">
                  About Me
                  <span className="ml-2 text-xs font-normal text-[var(--primary-500)]">
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
                <p className="text-xs text-[var(--text-400)] mt-1">
                  {aboutMe.length} characters
                </p>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[var(--text-200)] mb-1.5">
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
            <div className="bg-[var(--danger-900)]/40 border border-[var(--danger-600)]/40 text-[var(--danger-300)] px-4 py-3 rounded-lg text-sm mt-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`mt-5 w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
              saved
                ? "bg-[var(--success-600)]"
                : "bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-200)] hover:from-[var(--primary-700)] hover:to-[var(--secondary-300)]"
            }`}
          >
            {saving ? (
              "Saving..."
            ) : saved ? (
              <>
                <CheckCircleIcon fontSize="small" />
                Saved
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>

        {/* TikTok connection card */}
        {isCreator && (
          <div className="bg-[var(--background-700)] rounded-xl shadow-lg p-5 flex items-start gap-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(37,244,238,0.08)",
                border: "1px solid rgba(37,244,238,0.25)",
              }}
            >
              <MusicNoteIcon fontSize="small" style={{ color: "#25F4EE" }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-100)]">
                TikTok Connection
              </p>
              <p className="text-xs text-[var(--text-300)] mt-0.5 leading-relaxed">
                Connect your TikTok account from the profile menu (top right)
                to enable view tracking and payouts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
