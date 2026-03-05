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
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("✅ pgvector extension enabled!");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);

    // Full error object (useful for driver-specific fields)
    console.error("Full error object:", error);

    // Sequelize wraps the driver error in `.original` or `.parent`
    console.error(
      "Driver/original error:",
      error.original || error.parent || null,
    );

    // Stack trace
    console.error("Stack:", error.stack);

    // Mask and parse DATABASE_URL for host/port/user (do NOT print raw password)
    const raw = process.env.DATABASE_URL;
    try {
      if (raw) {
        const u = new URL(raw);
        const masked = `${u.protocol}//${u.username}:****@${u.hostname}${
          u.port ? `:${u.port}` : ""
        }${u.pathname || ""}`;
        console.error("DATABASE_URL (masked):", masked);
        console.error("Parsed connection info:", {
          protocol: u.protocol.replace(":", ""),
          hostname: u.hostname,
          port: u.port || "(default)",
          database: (u.pathname || "").replace(/^\//, "") || "(none)",
          username: u.username || "(none)",
        });
      } else {
        console.error("DATABASE_URL env var is not set");
      }
    } catch (parseErr) {
      console.error("Error parsing DATABASE_URL:", parseErr.message);
      // Show a safely masked raw value as fallback
      console.error(
        "Raw DATABASE_URL (masked):",
        raw ? raw.replace(/:(\/\/[^:]+:)([^@]+)@/, "$1****@") : raw,
      );
    }

    // Some Sequelize runtime options that may affect connection
    console.error("Sequelize dialect:", sequelize.getDialect());
    console.error("Sequelize options:", {
      dialectOptions: sequelize.options.dialectOptions,
      pool: sequelize.options.pool,
      logging: !!sequelize.options.logging,
    });

    return false;
  }
};

// Initialize database (create tables)
const initDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
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
