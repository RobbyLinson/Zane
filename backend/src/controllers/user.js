const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { User } = require("../models");
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
      `${process.env.FRONTEND_URL}/stripe/refresh`,
      `${process.env.FRONTEND_URL}/stripe/complete`
    );

    return res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe onboarding link error:", err);
    res
      .status(500)
      .json({ error: "Failed to generate Stripe onboarding link" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Provided by your auth middleware
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Exclude sensitive fields
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Get user profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getStripeOnboardingLink,
  getUserProfile,
};
