const { Campaign, Contract, User } = require("../models");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      max_payout: contract.max_payout / contract.num_campaigns,
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

const getMaxPayout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const campaigns = await Campaign.findAll({
      where: { creator_id: userId },
    });
    const totalMaxPayout = campaigns.reduce((sum, campaign) => {
      return (
        sum + parseFloat(campaign.max_payout - campaign.amount_withdrawn || 0)
      );
    }, 0);
    res.json({ totalMaxPayout });
  } catch (error) {
    console.error("Get max payout for user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCurrentPayout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const campaigns = await Campaign.findAll({
      where: { creator_id: userId },
      include: [{ model: Contract, as: "contract", attributes: ["cpm_rate"] }],
    });
    const totalCurrentPayout = campaigns.reduce((sum, campaign) => {
      return (
        sum +
        parseFloat(campaign.amount_earned - campaign.amount_withdrawn || 0)
      );
    }, 0);
    res.json({ totalCurrentPayout });
  } catch (error) {
    console.error("Get current payout for user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const withdrawUserBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.stripe_account_id) {
      return res.status(400).json({ error: "No Stripe account linked" });
    }

    let { amount } = req.body;
    amount = parseFloat(amount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid withdrawal amount" });
    }

    const balance = await stripe.balance.retrieve();
    console.log("Stripe Balance: ", balance);

    // Get all campaigns for user with contract included for CPM
    const campaigns = await Campaign.findAll({
      where: { creator_id: userId },
      include: [{ model: require("../models").Contract, as: "contract" }],
      order: [["createdAt", "ASC"]],
    });

    // Calculate total withdrawable
    const totalWithdrawable = campaigns.reduce((sum, campaign) => {
      const earned = parseFloat(campaign.amount_earned || 0);
      const withdrawn = parseFloat(campaign.amount_withdrawn || 0);
      return sum + Math.max(earned - withdrawn, 0);
    }, 0);

    if (amount > totalWithdrawable) {
      return res.status(400).json({
        error: `Requested amount: ${amount} exceeds withdrawable balance: ${totalWithdrawable}`,
      });
    }

    const paymentAmount = Math.round(amount * 100); // Only transfer requested amount

    // Stripe transfer
    let transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: paymentAmount,
        destination: user.stripe_account_id,
        description: `Zane payout for ${user.first_name} ${user.last_name}`,
        currency: "usd",
        metadata: {
          source: "zane-campaign-withdrawal",
        },
      });
    } catch (stripeErr) {
      console.error("Stripe transfer error:", stripeErr);
      return res.status(500).json({ error: "Stripe payout failed" });
    }

    // Update campaigns' withdrawn amounts
    let remaining = amount;
    for (const campaign of campaigns) {
      const earned = parseFloat(campaign.amount_earned || 0);
      const withdrawn = parseFloat(campaign.amount_withdrawn || 0);
      const available = Math.max(earned - withdrawn, 0);

      if (available <= 0) continue;

      const toWithdraw = Math.min(available, remaining);
      await campaign.update({
        amount_withdrawn: withdrawn + toWithdraw,
      });

      remaining -= toWithdraw;
      if (remaining <= 0) break;
    }

    res.json({
      message: "Withdrawal successful",
      withdrawn: amount,
      transferId: transfer.id,
      newBalance: totalWithdrawable - amount,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
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
  getMaxPayout,
  getCurrentPayout,
  withdrawUserBalance,
};
