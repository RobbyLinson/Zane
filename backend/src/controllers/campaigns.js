const { Campaign, Contract, User } = require("../models");

// Create a campaign (creator accepts a contract)
const createCampaign = async (req, res) => {
  try {
    const { contract_id } = req.body;
    const creator_id = req.user.userId;

    // Check contract exists and is active
    const contract = await Contract.findByPk(contract_id);
    if (!contract || contract.status !== "active") {
      return res.status(400).json({ error: "Invalid or inactive contract" });
    }

    // Prevent duplicate acceptance
    const existing = await Campaign.findOne({
      where: { contract_id, creator_id },
    });
    if (existing) {
      return res.status(400).json({ error: "Already accepted" });
    }

    const campaign = await Campaign.create({
      contract_id,
      creator_id,
      status: "accepted",
    });

    res.status(201).json({ campaign });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all campaigns for current user (creator or brand)
const getCampaigns = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.user_type;

    let where = {};
    if (userType === "creator") {
      where.creator_id = userId;
    } else if (userType === "brand") {
      where.brand_id = userId;
    }

    const campaigns = await Campaign.findAll({
      where,
      include: [
        { model: Contract, as: "contract" },
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });

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

    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
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
    const campaign = await Campaign.findByPk(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    await campaign.destroy();
    res.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCampaignsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const campaigns = await Campaign.findAll({
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
    res.json({ campaigns });
  } catch (error) {
    console.error("Get campaigns by user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignsByUser,
};
