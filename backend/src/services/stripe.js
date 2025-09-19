const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeAccount(user) {
  console.log("Creating Stripe account for user:", user);
  if (user.user_type === "creator") {
    console.log("User is a creator, creating Stripe Express account");
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      business_type: "individual",
      individual: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      capabilities: {
        transfers: { requested: true },
      },
    });
    console.log("Created Stripe account:", account);
    return account.id; // acct_xxx
  }

  if (user.user_type === "brand") {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.company_name || `${user.first_name} ${user.last_name}`,
    });
    return customer.id; // cus_xxx
  }

  throw new Error("Invalid user type for Stripe account creation");
}

async function generateStripeOnboardingLink(
  stripeAccountId,
  refreshUrl,
  returnUrl
) {
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  console.log("Generated Stripe account link:", accountLink);

  return accountLink;
}

module.exports = { createStripeAccount, generateStripeOnboardingLink };
