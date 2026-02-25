const express = require("express");
const {
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
} = require("../controllers/campaigns");
const { authenticateToken, requireUserType } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken);

router.get("/", getCampaigns);
router.get("/:id", getCampaign);
router.put("/:id", requireUserType("creator"), updateCampaign);
router.delete("/:id", requireUserType("creator"), deleteCampaign);

module.exports = router;
