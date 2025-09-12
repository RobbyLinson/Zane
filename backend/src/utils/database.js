const { Sequelize } = require("sequelize");
require("dotenv").config();

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Railway
    },
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
    return false;
  }
};

// Initialize database (create tables)
const initDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("✅ Database tables synced!");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
};
