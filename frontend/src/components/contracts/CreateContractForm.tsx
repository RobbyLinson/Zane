import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "../../services/api";
import type { CreateContractData } from "../../types";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CampaignIcon from "@mui/icons-material/Campaign";
import PaidIcon from "@mui/icons-material/Paid";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { FundContractForm } from "./FundContract";

const stripePromise = loadStripe(
  "pk_test_51S5Sp6DGlKLv8jZbbpa0BwpoyPfAYVgn0zjGzEDmlrRqBbiituzNro2xOtnx9z2RMqhRymUOzKZmsXyDhCOE8kNS00yYTnZgUO",
);

const PLATFORMS = [
  {
    value: "tiktok" as const,
    label: "TikTok",
    icon: <MusicNoteIcon fontSize="small" style={{ color: "#25F4EE" }} />,
  },
  {
    value: "instagram" as const,
    label: "Instagram",
    icon: <InstagramIcon fontSize="small" style={{ color: "#E1306C" }} />,
  },
  {
    value: "youtube_shorts" as const,
    label: "YT Shorts",
    icon: <YouTubeIcon fontSize="small" style={{ color: "#FF0000" }} />,
  },
];

interface CreateContractFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateContractForm: React.FC<CreateContractFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateContractData>({
    title: "",
    description: "",
    cpm_rate: 5.0,
    max_payout: 4000.0,
    min_views: 1000,
    platform: "tiktok",
    company_charge: 5000.0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMainModal, setShowMainModal] = useState(true);
  const [showFundModal, setShowFundModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "cpm_rate" || name === "min_views"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleBudgetChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      company_charge: value,
      max_payout: value * 0.8,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description?.trim()) {
      setError("A campaign description is required.");
      return;
    }
    setError("");
    setLoading(true);
    setShowMainModal(false);
    setShowFundModal(true);
    setLoading(false);
  };

  const handleMainModalOpenChange = (open: boolean) => {
    if (!open) {
      setShowMainModal(false);
      onCancel();
    }
  };

  const handleFundModalOpenChange = (open: boolean) => {
    if (!open) {
      setShowFundModal(false);
      onCancel();
    }
  };

  const handleFundSuccess = async () => {
    setLoading(true);
    try {
      await api.createContract(formData);
      setShowFundModal(false);
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create contract",
      );
    } finally {
      setLoading(false);
    }
  };

  const maxViews =
    formData.cpm_rate > 0
      ? Math.floor((formData.max_payout / formData.cpm_rate) * 1000)
      : 0;
  const platformCut = formData.company_charge * 0.2;
  const creatorPayout = formData.company_charge * 0.8;

  const sliderGradient = (val: number, min: number, max: number) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #23272f ${pct}%, #23272f 100%)`;
  };

  return (
    <>
      {/* Main contract form dialog */}
      <Dialog open={showMainModal} onOpenChange={handleMainModalOpenChange}>
        <DialogContent className="max-w-4xl p-0 bg-[var(--background-700)] text-[var(--text-100)] border border-[var(--border-900)]">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <AssignmentIcon
                    fontSize="medium"
                    style={{ color: "var(--primary-500)" }}
                  />
                  Create Campaign Contract
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Describe your campaign so the right creators find you through
                  Zane Recommendations.
                </DialogDescription>
              </div>
              <DialogClose
                onClick={() => {
                  setShowMainModal(false);
                  onCancel();
                }}
                className="text-[var(--text-300)] hover:text-[var(--text-100)] transition-colors text-2xl font-light leading-none mt-1 ml-4"
              >
                ×
              </DialogClose>
            </div>
          </DialogHeader>

          <form
            className="p-6 space-y-6 bg-[var(--background-700)]"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="bg-red-950/40 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* ── Budget ── */}
            <div className="bg-gradient-to-br from-[var(--primary-800)] to-[var(--secondary-800)] p-4 rounded-xl border border-[var(--primary-900)]">
              <h3 className="text-sm font-semibold text-[var(--text-100)] mb-3 flex items-center gap-2">
                <PaidIcon
                  fontSize="small"
                  style={{ color: "var(--primary-500)" }}
                />
                Campaign Budget
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-200)] mb-2">
                    CPM Rate: €{formData.cpm_rate.toLocaleString()} / 1K views
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={formData.cpm_rate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cpm_rate: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: sliderGradient(formData.cpm_rate, 5, 25),
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-300)] mt-1">
                    <span>€5</span>
                    <span>€25</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-200)] mb-2">
                    Total Budget: €{formData.company_charge.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="500"
                    value={formData.company_charge}
                    onChange={(e) =>
                      handleBudgetChange(parseInt(e.target.value))
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: sliderGradient(
                        formData.company_charge,
                        5000,
                        25000,
                      ),
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-300)] mt-1">
                    <span>€5K</span>
                    <span>€25K</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <div className="text-xs text-[var(--text-300)] mb-1">
                    Platform Fee
                  </div>
                  <div className="text-base font-semibold text-[var(--text-100)]">
                    €{platformCut.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <div className="text-xs text-[var(--text-300)] mb-1">
                    Creator Payout
                  </div>
                  <div className="text-base font-semibold text-[var(--primary-500)]">
                    €{creatorPayout.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <div className="text-xs text-[var(--text-300)] mb-1">
                    Max Views
                  </div>
                  <div className="text-base font-semibold text-[var(--secondary-200)]">
                    {maxViews.toLocaleString()}
                  </div>
                </div>
                <div className="bg-[var(--background-600)] p-3 rounded-lg border border-[var(--border-900)]">
                  <label className="block text-xs text-[var(--text-300)] mb-1">
                    Min Views
                  </label>
                  <input
                    type="text"
                    name="min_views"
                    value={
                      formData.min_views
                        ? formData.min_views.toLocaleString()
                        : "1,000"
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (value === "" || !isNaN(Number(value))) {
                        handleChange({
                          target: { name: "min_views", value },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                    className="w-full text-base font-semibold text-[var(--secondary-200)] bg-transparent border-none focus:outline-none p-0"
                  />
                </div>
              </div>
            </div>

            {/* ── Title + Platform ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                  Campaign Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Summer Skincare Launch"
                  className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] bg-[var(--background-600)] text-[var(--text-100)] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                  Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, platform: value }))
                      }
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all text-xs ${
                        formData.platform === value
                          ? "bg-[var(--primary-500)] border-[var(--primary-700)] text-white"
                          : "bg-[var(--background-600)] border-[var(--border-900)] text-[var(--text-300)] hover:border-[var(--primary-500)]"
                      }`}
                    >
                      {icon}
                      <span className="mt-1">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Description (embedding source) ── */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-200)] mb-1">
                Campaign Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe your brand, the product or campaign goal, who your ideal creator is, and the type of content you're looking for. This powers Zane Recommendations — be specific."
                className="w-full px-3 py-2 border border-[var(--border-900)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none bg-[var(--background-600)] text-[var(--text-100)] text-sm"
              />
              <p className="text-xs text-[var(--text-300)] mt-1">
                {formData.description?.length ?? 0} chars
              </p>
            </div>

            <DialogFooter>
              <p className="text-xs text-[var(--text-300)]">
                All amounts in EUR · Subject to platform terms
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowMainModal(false);
                    onCancel();
                  }}
                  className="text-[var(--text-300)] hover:text-[var(--text-100)]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-200)] text-white hover:from-[var(--primary-700)] hover:to-[var(--secondary-300)] px-6"
                >
                  {loading ? (
                    "Creating..."
                  ) : (
                    <span className="flex items-center gap-1">
                      <CampaignIcon fontSize="small" />
                      Launch Campaign
                    </span>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment dialog — shown after form submit */}
      {showFundModal && (
        <Dialog open={showFundModal} onOpenChange={handleFundModalOpenChange}>
          <DialogContent className="max-w-2xl bg-[var(--background-700)] text-[var(--text-100)] border border-[var(--border-900)]">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    <PaidIcon
                      fontSize="medium"
                      style={{ color: "var(--primary-500)" }}
                    />
                    Fund Campaign
                  </DialogTitle>
                  <DialogDescription>
                    Enter your payment details to fund €
                    {formData.company_charge.toLocaleString()} for this
                    campaign.
                  </DialogDescription>
                </div>
                <DialogClose
                  onClick={() => {
                    setShowFundModal(false);
                    onCancel();
                  }}
                  className="text-[var(--text-300)] hover:text-[var(--text-100)] transition-colors text-2xl font-light leading-none mt-1 ml-4"
                >
                  ×
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="p-6">
              <Elements stripe={stripePromise}>
                <FundContractForm
                  contractDraft={formData}
                  onSuccess={handleFundSuccess}
                  onCancel={() => {
                    setShowFundModal(false);
                    onCancel();
                  }}
                />
              </Elements>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CreateContractForm;
