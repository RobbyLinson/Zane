class PaymentService {
  constructor() {
    this.platformFeeRate = 0.2; // 10% platform fee
  }

  /**
   * Step 1: Create campaign funding (escrow)
   */
  async fundCampaign(campaignId, brandStripeAccountId = null) {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const campaign = await Campaign.findByPk(campaignId, {
      include: [{ model: User, as: "creator" }],
    });

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Create payment intent to hold brand funds
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(campaign.budget_amount) * 100), // Convert to cents
      currency: "usd",
      metadata: {
        campaign_id: campaignId,
        type: "campaign_funding",
      },
    });

    // Update campaign with payment info
    await campaign.update({
      stripe_payment_intent_id: paymentIntent.id,
      budget_status: "pending",
    });

    return {
      campaign,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
    };
  }

  /**
   * Step 2: Confirm funding
   */
  async confirmCampaignFunding(campaignId) {
    const campaign = await Campaign.findByPk(campaignId);

    await campaign.update({
      budget_status: "funded",
      funded_at: new Date(),
      tracking_start_date: new Date(),
    });

    return campaign;
  }

  /**
   * Step 3: Calculate payout based on current views
   */
  async calculatePayout(campaignId) {
    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const viewCount = parseInt(campaign.current_views);
    const cpmRate = parseFloat(campaign.cpm_rate);

    // Calculate gross earnings: (views / 1000) * CPM rate
    const grossEarnings = (viewCount / 1000) * cpmRate;

    // Apply budget cap
    const budgetAmount = parseFloat(campaign.budget_amount);
    const cappedEarnings = Math.min(grossEarnings, budgetAmount);

    // Calculate platform fee
    const platformFee = cappedEarnings * this.platformFeeRate;
    const netEarnings = cappedEarnings - platformFee;

    // Calculate amount due (total earned - already paid)
    const totalPaidOut = parseFloat(campaign.total_paid_out);
    const amountDue = Math.max(0, netEarnings - totalPaidOut);

    return {
      viewCount,
      grossEarnings,
      cappedEarnings,
      platformFee,
      netEarnings,
      totalPaidOut,
      amountDue,
      cpmRate,
    };
  }

  /**
   * Step 4: Create and process payout
   */
  async createPayout(campaignId) {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [{ model: User, as: "creator" }],
    });

    const calculation = await this.calculatePayout(campaignId);

    if (calculation.amountDue <= 0) {
      throw new Error("No payout due");
    }

    // Create payout record
    const payout = await Payout.create({
      user_id: campaign.creator.id,
      campaign_id: campaignId,
      amount: calculation.amountDue,
      platform_fee: calculation.amountDue * this.platformFeeRate,
      net_amount: calculation.amountDue * (1 - this.platformFeeRate),
      views_at_payout: calculation.viewCount,
      cmp_rate_used: calculation.cpmRate,
      status: "pending",
    });

    // Update campaign totals
    await campaign.update({
      total_earned: calculation.netEarnings,
      total_paid_out:
        parseFloat(campaign.total_paid_out) + calculation.amountDue,
    });

    return { payout, calculation };
  }

  /**
   * Step 5: Process actual Stripe transfer
   */
  async processPayout(payoutId) {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    const payout = await Payout.findByPk(payoutId, {
      include: [{ model: User, as: "user" }],
    });

    if (!payout.user.stripe_connect_account_id) {
      throw new Error("Creator has no Stripe Connect account");
    }

    payout.status = "processing";
    await payout.save();

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(parseFloat(payout.net_amount) * 100),
        currency: "usd",
        destination: payout.user.stripe_connect_account_id,
      });

      await payout.update({
        status: "completed",
        stripe_transfer_id: transfer.id,
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
   * Update view count (manual for now)
   */
  async updateViews(campaignId, newViewCount) {
    const campaign = await Campaign.findByPk(campaignId);

    await campaign.update({
      current_views: newViewCount,
      last_view_update: new Date(),
    });

    return campaign;
  }
}

module.exports = { Campaign, Payout, PaymentService: new PaymentService() };
