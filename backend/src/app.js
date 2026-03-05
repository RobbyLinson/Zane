const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { testConnection, initDatabase } = require("./utils/database");
const { User, Contract } = require("./models");
const { generateEmbedding } = require("./services/embedding");
const { authenticateToken } = require("./middleware/auth");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://joinzane.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow any ngrok tunnel (used for local development sharing)
      if (origin.endsWith(".ngrok-free.app") || origin.endsWith(".ngrok-free.dev") || origin.endsWith(".ngrok.io")) {
        return callback(null, true);
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);
// Webhook route must be registered before express.json() — needs raw body for signature verification
app.use("/api/webhooks", require("./routes/webhooks"));

app.use(express.json());

// Backfill embeddings for any seeded rows that are missing them
const seedEmbeddings = async () => {
  let contracts = 0;
  let users = 0;

  const contractsToEmbed = await Contract.findAll({ where: { description_embedding: null } });
  for (const c of contractsToEmbed) {
    await c.update({ description_embedding: await generateEmbedding(c.description) });
    contracts++;
  }

  const usersToEmbed = await User.findAll({ where: { about_me_embedding: null } });
  for (const u of usersToEmbed) {
    if (u.about_me) {
      await u.update({ about_me_embedding: await generateEmbedding(u.about_me) });
      users++;
    }
  }

  console.log(`✅ Embeddings seeded — contracts: ${contracts}, users: ${users}`);
  return { contracts, users };
};

// Test database on startup
testConnection().then((success) => {
  if (success) {
    initDatabase().then(() => seedEmbeddings().catch(console.error));
  }
});

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CPM Tool API is running" });
});

// Admin utility — regenerate missing embeddings on demand (auth required)
app.post("/api/admin/seed-embeddings", authenticateToken, async (_req, res) => {
  try {
    const result = await seedEmbeddings();
    res.json({ message: "Embeddings seeded", ...result });
  } catch (err) {
    console.error("Seed embeddings error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiLimiter);
app.use("/api/auth", require("./routes/auth"));

app.use("/api/contracts", require("./routes/contracts"));

app.use("/api/campaigns", require("./routes/campaigns"));

app.use("/api/user", require("./routes/user"));

app.use("/api/payments", require("./routes/payments"));

app.use("/api/tiktok", require("./routes/tiktok"));

module.exports = app;
