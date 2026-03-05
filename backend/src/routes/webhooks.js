const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { Contract, Campaign, User } = require("../models");

// This route must use raw body — do NOT apply express.json() before it.
// The raw body middleware is applied per-route here via express.raw().
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { type, brand_id, title } = paymentIntent.metadata;

      if (type === "contract_funding_draft") {
        try {
          // Find the contract that matches this payment intent (stored on creation)
          const contract = await Contract.findOne({
            where: { stripe_payment_intent_id: paymentIntent.id },
          });

          if (contract && contract.status === "draft") {
            await contract.update({ status: "active" });
            console.log(`Contract ${contract.id} activated via webhook`);
          } else if (!contract) {
            console.warn(
              `payment_intent.succeeded for unknown contract: pi=${paymentIntent.id} brand=${brand_id} title=${title}`
            );
          }
        } catch (err) {
          console.error("Webhook contract activation error:", err);
          // Still return 200 — Stripe will retry on 5xx
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const { type } = paymentIntent.metadata;

      if (type === "contract_funding_draft") {
        try {
          const contract = await Contract.findOne({
            where: { stripe_payment_intent_id: paymentIntent.id },
          });
          if (contract && contract.status === "draft") {
            await contract.update({ status: "cancelled" });
            console.log(`Contract ${contract.id} cancelled after failed payment`);
          }
        } catch (err) {
          console.error("Webhook contract cancellation error:", err);
        }
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
