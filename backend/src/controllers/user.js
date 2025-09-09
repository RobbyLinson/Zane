const { generateStripeOnboardingLink } = require("../services/stripe");
const { User } = require("../models");

const getStripeOnboardingLink = async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  console.log("Generating Stripe onboarding link for user:", user);
  if (user.user_type !== "creator") {
    return res
      .status(403)
      .json({ error: "Only creators need Stripe onboarding" });
  }

  try {
    const url = await generateStripeOnboardingLink(
      user.stripe_account_id,
      `${process.env.FRONTEND_URL}/stripe/refresh`,
      `${process.env.FRONTEND_URL}/stripe/complete`
    );
    res.json({ url });
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
