const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignsByUser,
  getMaxPayout,
} = require("../controllers/campaigns");
const { authenticateToken, requireUserType } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.post("/", requireUserType("creator"), createCampaign);
router.get("/", getCampaigns);
router.get("/user/:userId", getCampaignsByUser);
router.get("/max-payout", getMaxPayout);
router.get("/:id", getCampaign);
router.put("/:id", requireUserType("creator"), updateCampaign);
router.delete("/:id", requireUserType("creator"), deleteCampaign);

module.exports = router;
