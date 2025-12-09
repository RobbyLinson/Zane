import React from "react";
import type { Contract } from "../../types";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

interface ContractCardProps {
  contract: Contract;
  userType: "creator" | "brand";
  onAccept?: (contractId: string) => void;
  onEdit?: (contract: Contract) => void;
  onView?: (contract: Contract) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  userType,
  onAccept,
  onEdit,
  onView,
}) => {
  const maxViews = Math.floor((contract.max_payout / contract.cpm_rate) * 1000);

  return (
    <div className="bg-[var(--background-700)] rounded-lg shadow-md p-6 border border-[var(--border-900)] hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--text-100)] mb-2">
            {contract.title}
          </h3>
          {contract.brand && (
            <p className="text-sm text-[var(--text-300)] mb-2">
              by{" "}
              {contract.brand.company_name ||
                `${contract.brand.first_name} ${contract.brand.last_name}`}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              contract.status === "active"
                ? "bg-green-100 text-green-800"
                : contract.status === "paused"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {contract.status}
          </span>
          <span className="text-xs text-[var(--text-300)] mt-1 capitalize">
            {contract.platform}
          </span>
        </div>
      </div>

      {contract.description && (
        <p className="text-[var(--text-200)] mb-4 text-sm line-clamp-2">
          {contract.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-[var(--text-300)] uppercase tracking-wide">
            CPM Rate
          </p>
          <p className="text-lg font-semibold text-[var(--primary-500)]">
            €{contract.cpm_rate}
          </p>
          <p className="text-xs text-[var(--text-300)]">per 1,000 views</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-300)] uppercase tracking-wide">
            Max Payout
          </p>
          <p className="text-lg font-semibold text-[var(--secondary-200)]">
            €{contract.max_payout}
          </p>
          <p className="text-xs text-[var(--text-300)]">
            up to {maxViews.toLocaleString()} views
          </p>
        </div>
      </div>

      {contract.target_audience && (
        <div className="mb-4">
          <p className="text-xs text-[var(--text-300)] uppercase tracking-wide mb-1">
            Target Audience
          </p>
          <p className="text-sm text-[var(--text-200)]">
            {contract.target_audience}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-[var(--border-900)]">
        <div className="text-xs text-[var(--text-300)]">
          Min. {contract.min_views.toLocaleString()} views required
        </div>

        <div className="flex space-x-2">
          {onView && (
            <button
              onClick={() => onView(contract)}
              className="px-3 py-1 text-sm text-[var(--secondary-200)] hover:text-[var(--primary-500)] flex items-center gap-1"
            >
              <VisibilityIcon fontSize="small" /> View Details
            </button>
          )}

          {userType === "creator" && onAccept && (
            <button
              onClick={() => onAccept(contract.id)}
              className="px-4 py-2 bg-[var(--primary-500)] text-white text-sm rounded hover:bg-[var(--primary-700)] flex items-center gap-1"
            >
              <CheckCircleIcon fontSize="small" /> Accept Contract
            </button>
          )}

          {userType === "brand" && onEdit && (
            <button
              onClick={() => onEdit(contract)}
              className="px-4 py-2 bg-[var(--background-600)] text-[var(--text-100)] text-sm rounded hover:bg-[var(--background-700)] flex items-center gap-1"
            >
              <EditIcon fontSize="small" /> Edit
            </button>
          )}
        </div>
      </div>

      {userType === "brand" &&
        contract.campaigns &&
        contract.campaigns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border-900)]">
            <p className="text-xs text-[var(--text-300)] mb-2">
              {contract.campaigns.length} creator
              {contract.campaigns.length > 1 ? "s" : ""} accepted
            </p>
            <div className="flex flex-wrap gap-1">
              {contract.campaigns.slice(0, 3).map((campaign) => (
                <span
                  key={campaign.id}
                  className="text-xs bg-[var(--primary-500)] text-white px-2 py-1 rounded"
                >
                  {campaign.creator?.first_name} {campaign.creator?.last_name}
                </span>
              ))}
              {contract.campaigns.length > 3 && (
                <span className="text-xs text-[var(--text-300)]">
                  +{contract.campaigns.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
    </div>
  );
};
