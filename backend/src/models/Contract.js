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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cpm_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Rate per 1000 views in euros
    },
    max_payout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false, // Maximum total payout
    },
    min_views: {
      type: DataTypes.INTEGER,
      defaultValue: 1000, // Minimum views required
    },
    target_audience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content_requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    platform: {
      type: DataTypes.ENUM("tiktok", "instagram", "youtube_shorts"),
      defaultValue: "tiktok",
    },
    company_charge: {
      type: DataTypes.DECIMAL(10, 2),
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
