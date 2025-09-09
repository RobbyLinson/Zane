const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

const Payout = sequelize.define(
  "Payout",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
      defaultValue: "pending",
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failure_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "USD",
    },
  },
  {
    tableName: "payouts",
    timestamps: true,
  }
);

module.exports = Payout;
