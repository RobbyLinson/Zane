const express = require("express");
const {
  createContract,
  getContracts,
  getNumAvailableContracts,
  getRecommendedContracts,
  getContract,
  updateContract,
  acceptContract,
} = require("../controllers/contracts");
const { authenticateToken, requireUserType } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get contracts (different views for brands vs creators)
router.get("/", getContracts);

// Static routes MUST come before /:id to prevent param capture
router.get("/available/count", getNumAvailableContracts);
router.get("/recommended", requireUserType("creator"), getRecommendedContracts);

// Get single contract
router.get("/:id", getContract);

// Brand-only routes
router.post("/", requireUserType("brand"), createContract);
router.put("/:id", requireUserType("brand"), updateContract);

// Creator-only routes
router.post("/:id/accept", requireUserType("creator"), acceptContract);

module.exports = router;
