const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

const SocialAccount = sequelize.define(
  "SocialAccount",
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
    platform: {
      type: DataTypes.ENUM("tiktok", "instagram", "youtube"),
      allowNull: false,
    },
    platform_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    platform_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    follower_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "social_accounts",
    timestamps: true,
  }
);

module.exports = SocialAccount;
