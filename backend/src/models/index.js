const { sequelize } = require("../utils/database");
const User = require("./User");
const Contract = require("./Contract");
const Campaign = require("./Campaign");
const SocialAccount = require("./SocialAccount");
const Payout = require("./Payout");

// Define relationships
User.hasMany(Contract, { foreignKey: "brand_id", as: "createdContracts" });
User.hasMany(Campaign, { foreignKey: "creator_id", as: "campaigns" });
User.hasMany(SocialAccount, { foreignKey: "user_id", as: "socialAccounts" });
User.hasMany(Payout, { foreignKey: "user_id", as: "payouts" });

Contract.belongsTo(User, { foreignKey: "brand_id", as: "brand" });
Contract.hasMany(Campaign, { foreignKey: "contract_id", as: "campaigns" });

Campaign.belongsTo(User, { foreignKey: "creator_id", as: "creator" });
Campaign.belongsTo(Contract, { foreignKey: "contract_id", as: "contract" });

SocialAccount.belongsTo(User, { foreignKey: "user_id", as: "user" });
Payout.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  sequelize,
  User,
  Contract,
  Campaign,
  SocialAccount,
  Payout,
};
