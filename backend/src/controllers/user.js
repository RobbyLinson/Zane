const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { User, Campaign, Contract } = require("../models");
const { generateStripeOnboardingLink } = require("../services/stripe");

const getStripeOnboardingLink = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    console.log("Generating Stripe onboarding link for user:", user);
    if (user.user_type !== "creator") {
      return res
        .status(403)
        .json({ error: "Only creators need Stripe onboarding" });
    }

    // Fetch the account status from Stripe
    const account = await stripe.accounts.retrieve(user.stripe_account_id);

    // If onboarding already complete, don’t return a new link
    if (account.details_submitted && account.charges_enabled) {
      return res.json({
        url: null,
        message: "Stripe account already onboarded",
      });
    }

    // Otherwise, generate a fresh onboarding link
    const accountLink = await generateStripeOnboardingLink(
      user.stripe_account_id,
      `${process.env.FRONTEND_URL}/dashboard`,
      `${process.env.FRONTEND_URL}/dashboard`,
    );

    return res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe onboarding link error:", err);
    res
      .status(500)
      .json({ error: "Failed to generate Stripe onboarding link" });
  }
};

// GET /user/earnings — returns max possible and currently available earnings for a creator
const getEarnings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const campaigns = await Campaign.findAll({
      where: { creator_id: userId },
      include: [{ model: Contract, as: "contract", attributes: ["cpm_rate"] }],
    });

    let maxPayout = 0;
    let currentPayout = 0;

    campaigns.forEach((campaign) => {
      const earned = parseFloat(campaign.amount_earned || 0);
      const withdrawn = parseFloat(campaign.amount_withdrawn || 0);
      const maxCampaign = parseFloat(campaign.max_payout || 0);
      maxPayout += Math.max(maxCampaign - withdrawn, 0);
      currentPayout += Math.max(earned - withdrawn, 0);
    });

    res.json({ maxPayout, currentPayout });
  } catch (err) {
    console.error("Get earnings error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /user/withdraw — transfer earned balance to creator’s Stripe account
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

    const campaigns = await Campaign.findAll({
      where: { creator_id: userId },
      include: [{ model: Contract, as: "contract" }],
      order: [["createdAt", "ASC"]],
    });

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

    let transfer;
    try {
      transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        destination: user.stripe_account_id,
        description: `Zane payout for ${user.first_name} ${user.last_name}`,
        currency: "usd",
        metadata: { source: "zane-campaign-withdrawal" },
      });
    } catch (stripeErr) {
      console.error("Stripe transfer error:", stripeErr);
      return res.status(500).json({ error: "Stripe payout failed" });
    }

    let remaining = amount;
    for (const campaign of campaigns) {
      const earned = parseFloat(campaign.amount_earned || 0);
      const withdrawn = parseFloat(campaign.amount_withdrawn || 0);
      const available = Math.max(earned - withdrawn, 0);

      if (available <= 0) continue;

      const toWithdraw = Math.min(available, remaining);
      await campaign.update({ amount_withdrawn: withdrawn + toWithdraw });

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
  getStripeOnboardingLink,
  getEarnings,
  withdrawUserBalance,
};
