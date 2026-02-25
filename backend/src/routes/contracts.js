const express = require("express");
const {
  createContract,
  getContracts,
  getNumAvailableContracts,
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

router.get("/available/count", getNumAvailableContracts);

// Get single contract
router.get("/:id", getContract);

// Brand-only routes
router.post("/", requireUserType("brand"), createContract);
router.put("/:id", requireUserType("brand"), updateContract);

// Creator-only routes
router.post("/:id/accept", requireUserType("creator"), acceptContract);

module.exports = router;
