const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

const Campaign = sequelize.define(
  "Campaign",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contract_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contracts",
        key: "id",
      },
    },
    creator_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content_url: {
      type: DataTypes.STRING,
      allowNull: true, // URL to the created content
    },
    views_tracked: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    amount_earned: {
      type: DataTypes.VIRTUAL,
      get() {
        const views = this.getDataValue("views_tracked") || 0;
        const contract = this.get("contract"); // must include in query
        const cpm = contract?.cpm_rate ? parseFloat(contract.cpm_rate) : 0;
        return ((views / 1000) * cpm).toFixed(2);
      },
    },
    status: {
      type: DataTypes.ENUM(
        "accepted",
        "content_created",
        "tracking",
        "completed",
        "paid"
      ),
      defaultValue: "accepted",
    },
    content_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    content_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Whether brand approved the content",
    },
    last_tracked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    max_payout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment:
        "Max payout for this campaign (contract.max_payout / contract.num_campaigns)",
    },
    amount_withdrawn: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
  },
  {
    tableName: "campaigns",
    timestamps: true,
  }
);

module.exports = Campaign;
