const { generateStripeOnboardingLink } = require("../services/stripe");

const getStripeOnboardingLink = async (req, res) => {
  const user = req.user;
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

module.exports = {
  getStripeOnboardingLink,
};
