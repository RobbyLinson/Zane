const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

const Contract = sequelize.define(
  "Contract",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Required: used as the primary text for semantic embedding + creator display
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // 384-dim float array (Xenova/all-MiniLM-L6-v2); populated on create/update
    description_embedding: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    cpm_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    max_payout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    min_views: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
    },
    platform: {
      type: DataTypes.ENUM("tiktok", "instagram", "youtube_shorts"),
      defaultValue: "tiktok",
    },
    company_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    num_campaigns: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "paused", "completed", "cancelled"),
      defaultValue: "active",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "contracts",
    timestamps: true,
  }
);

module.exports = Contract;
