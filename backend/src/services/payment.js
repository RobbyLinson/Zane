const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Campaign = require("../models/Campaign");
const Contract = require("../models/Contract");
const Payout = require("../models/Payout");
const User = require("../models/User");

class PaymentService {
  constructor() {
    this.platformFeeRate = parseFloat(process.env.PLATFORM_FEE_RATE) || 0.2;
  }

  /**
   * Step 1: Fund a contract (escrow)
   * Charge company_charge, set aside max_payout for creator.
   */
  async fundContractDraft(contractDraft, brandId) {
    const companyCharge = parseFloat(contractDraft.company_charge);
    if (!companyCharge || companyCharge <= 0) {
      throw new Error("Invalid company charge");
    }
    const platformFee = companyCharge * this.platformFeeRate;
    const maxPayout = companyCharge - platformFee;

    const user = await User.findByPk(brandId);

    const stripeCustomerId = user.stripe_account_id;

    console.log("Customer ID:", stripeCustomerId);
    if (!stripeCustomerId) {
      throw new Error("Brand has no Stripe customer ID");
    }
    console.log(`creating payment intent for customer ${stripeCustomerId}`);
    // Create PaymentIntent for the full contract charge
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(companyCharge * 100), // in cents
      currency: "usd",
      customer: stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/payment/complete`,
      metadata: {
        type: "contract_funding_draft",
        brand_id: brandId,
        title: contractDraft.title,
      },
    });

    // Optionally: Store a temporary record if you want to track drafts

    return {
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
      platformFee,
      maxPayout,
    };
  }

  /**
   * Step 2: Confirm campaign funding
   */
  async confirmCampaignFunding(campaignId) {
    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await campaign.update({
      status: "tracking",
      last_tracked_at: new Date(),
    });

    return campaign;
  }

  /**
   * Step 3: Calculate payout based on views
   * Creator can earn up to max_payout, platform fee already taken.
   */
  async calculatePayout(campaignId) {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [{ model: Contract, as: "contract" }],
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }
    if (!campaign.contract) {
      throw new Error("Campaign missing contract");
    }

    const viewCount = parseInt(campaign.views_tracked);
    const cpmRate = parseFloat(campaign.contract.cpm_rate);
    const companyCharge = parseFloat(campaign.contract.company_charge);
    const platformFee = companyCharge * this.platformFeeRate;
    const maxPayout = companyCharge - platformFee;

    // gross earnings = (views / 1000) * CPM
    const grossEarnings = (viewCount / 1000) * cpmRate;
    const cappedEarnings = Math.min(grossEarnings, maxPayout);

    const alreadyEarned = parseFloat(campaign.amount_earned);
    const amountDue = Math.max(0, cappedEarnings - alreadyEarned);

    return {
      viewCount,
      grossEarnings,
      cappedEarnings,
      alreadyEarned,
      amountDue,
      cpmRate,
      maxPayout,
      companyCharge,
      platformFee,
    };
  }

  /**
   * Step 4: Create payout record
   */
  async createPayout(campaignId) {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        { model: User, as: "creator" },
        { model: Contract, as: "contract" },
      ],
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const calculation = await this.calculatePayout(campaignId);

    if (calculation.amountDue <= 0) {
      throw new Error("No payout due");
    }

    const payout = await Payout.create({
      user_id: campaign.creator_id,
      campaign_id: campaignId,
      amount: calculation.amountDue,
      status: "pending",
      currency: "USD",
    });

    await campaign.update({
      amount_earned: parseFloat(campaign.amount_earned) + calculation.amountDue,
    });

    return { payout, calculation };
  }

  /**
   * Step 5: Process Stripe transfer to creator
   */
  async processPayout(payoutId) {
    const payout = await Payout.findByPk(payoutId, {
      include: [{ model: User, as: "user" }],
    });

    if (!payout) {
      throw new Error("Payout not found");
    }
    if (!payout.user.stripe_connect_account_id) {
      throw new Error("Creator has no Stripe Connect account");
    }

    payout.status = "processing";
    await payout.save();

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(parseFloat(payout.amount) * 100),
        currency: payout.currency,
        destination: payout.user.stripe_connect_account_id,
      });

      await payout.update({
        status: "completed",
        processed_at: new Date(),
      });

      return { payout, transfer };
    } catch (error) {
      await payout.update({
        status: "failed",
        failure_reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Step 6: Update campaign views
   */
  async updateViews(campaignId, newViewCount) {
    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await campaign.update({
      views_tracked: newViewCount,
      last_tracked_at: new Date(),
    });

    return campaign;
  }
}

module.exports = new PaymentService();
