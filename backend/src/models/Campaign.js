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
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
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
    last_tracked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "campaigns",
    timestamps: true,
  }
);

module.exports = Campaign;
