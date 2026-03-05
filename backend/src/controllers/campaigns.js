const { Campaign, Contract, User } = require("../models");

// Get all campaigns for current user (creator sees own; brand sees campaigns under their contracts)
const getCampaigns = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    const userType = user.user_type;

    let campaigns;

    if (userType === "creator") {
      campaigns = await Campaign.findAll({
        where: { creator_id: userId },
        include: [
          { model: Contract, as: "contract" },
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      });
    } else {
      // Brand: get campaigns that belong to contracts they own
      campaigns = await Campaign.findAll({
        include: [
          {
            model: Contract,
            as: "contract",
            where: { brand_id: userId },
            required: true,
          },
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      });
    }

    res.json({ campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single campaign
const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByPk(id, {
      include: [
        { model: Contract, as: "contract" },
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json({ campaign });
  } catch (error) {
    console.error("Get campaign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update campaign (status, etc.)
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.userId;

    const campaign = await Campaign.findByPk(id, {
      include: [{ model: Contract, as: "contract" }],
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const isCreator = campaign.creator_id === userId;
    const isBrand = campaign.contract && campaign.contract.brand_id === userId;
    if (!isCreator && !isBrand) {
      return res.status(403).json({ error: "Access denied" });
    }

    await campaign.update(updates);
    res.json({ campaign });
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const campaign = await Campaign.findByPk(id, {
      include: [{ model: Contract, as: "contract" }],
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const isCreator = campaign.creator_id === userId;
    const isBrand = campaign.contract && campaign.contract.brand_id === userId;
    if (!isCreator && !isBrand) {
      return res.status(403).json({ error: "Access denied" });
    }

    await campaign.destroy();
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
};
