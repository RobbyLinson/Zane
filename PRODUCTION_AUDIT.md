# Production Readiness Audit — Zane

Generated: 2026-03-05

This document captures every issue identified before the first live customer deployment,
ordered by severity. Items marked with code changes have been or will be fixed in this
branch. Items marked as infra/env only require dashboard or config changes.

---

## STOP EVERYTHING FIRST — Credentials Exposed

The `backend/.env` file contains real secrets. If this file was ever committed to git,
those secrets are burned regardless of adding a `.gitignore` now.

**Actions required before anything else:**

1. Run `git log --all --full-history -- backend/.env` and `git log --all --full-history -- frontend/.env`.
   If commits appear, the secrets are in history and must be rotated.
2. Rotate every secret immediately:
   - Regenerate the Supabase DB password
   - Roll the JWT secret (all existing sessions will be invalidated — acceptable)
   - Revoke and regenerate TikTok client credentials
   - Stripe test keys are lower risk but rotate them anyway
3. Add `.env` to `.gitignore` in both `backend/` and `frontend/` (done in this commit).
4. Set all secrets as environment variables in Railway and Supabase dashboards only.
   Never store secrets in files that can touch the repository.

---

## Critical Stripe Issues

### 1. Still in Test Mode — Code Change: No, Env Change: Yes

Both keys in `backend/.env` are `sk_test_...` / `pk_test_...`. Test mode cards never
charge real money.

Before going live:
- Complete Stripe's business verification process on the Stripe dashboard
- Switch to `sk_live_...` and `pk_live_...` in Railway env vars
- Set `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` in your frontend build env
- Re-test the full payment flow end-to-end with live keys in a staging environment

### 2. No Stripe Webhook — Payment Flow Is Broken — Code Change: YES (done)

The entire contract funding flow relied on the frontend calling `onSuccess()` after
`stripe.confirmCardPayment()`. If the browser crashes, tab is closed, or network drops
after the charge goes through, money is collected but no contract is created.

Additionally, `POST /api/payments/campaign/:campaignId/confirm` had zero payment
verification — any authenticated user could call it to mark any campaign as funded.

**Fix:** Added `POST /api/webhooks/stripe` with `stripe.webhooks.constructEvent()`
signature verification. The `payment_intent.succeeded` event now drives contract creation
server-side. Set `STRIPE_WEBHOOK_SECRET` in Railway using the secret from your Stripe
dashboard webhook configuration.

### 3. `stripe_connect_account_id` Field Does Not Exist — Code Change: YES (done)

`backend/src/services/payment.js:164` referenced `payout.user.stripe_connect_account_id`
but the User model field is `stripe_account_id`. The `processPayout` route always threw
"Creator has no Stripe Connect account". Fixed to use the correct field name.

### 4. Stripe Publishable Key Missing From Frontend Env — Env Change: Yes

`frontend/.env` had no `VITE_STRIPE_PUBLISHABLE_KEY`. Wherever `loadStripe()` is called
this key must be provided. Set it in your frontend build environment (Vercel/Netlify/Railway
static env vars) as the live publishable key before deploying.

### 5. Transfers Can Fail Without Settled Funds

`withdrawUserBalance` calls `stripe.transfers.create()` drawing from your platform
Stripe balance. Stripe settlements take 2+ business days. If a creator withdraws before
the brand's payment settles, the transfer fails with an insufficient balance error.

**Short-term mitigation:** Show creators a note that withdrawals may take 2 business
days to process.
**Longer-term fix:** Use Stripe's `transfer_data` or `on_behalf_of` on the PaymentIntent,
or implement a scheduled settlement check before executing transfers.

### 6. No Idempotency on Withdrawals

If the Stripe transfer succeeds but the DB update fails, `amount_withdrawn` is never
updated and the creator can withdraw the same balance again. Stripe idempotency keys
should be added to the transfer call.

---

## Critical Authorization & Security Issues

### 7. `updateCampaign` / `deleteCampaign` Had No Ownership Check — Code Change: YES (done)

Any authenticated user could update or delete any campaign by ID. Added ownership
checks: creators can only modify their own campaigns, brands can only modify campaigns
under their contracts.

### 8. `user_type` Was Missing From JWT — `getCampaigns` Broken — Code Change: YES (done)

`generateToken` only signed `{ userId }`. The `getCampaigns` controller used
`req.user.user_type` which was always `undefined`, so every user (creator or brand)
hit the brand query path. Creators saw no campaigns.

Fixed by fetching the user from the DB in `getCampaigns`, consistent with how
`getContracts` already handled this correctly.

### 9. Admin Embedding Endpoint Was Unprotected — Code Change: YES (done)

`POST /api/admin/seed-embeddings` had no authentication. Anyone could trigger expensive
embedding regeneration. Added `authenticateToken` middleware.

---

## Important Logic Bugs

### 10. `amount_earned` Is a Virtual Field — Cannot Be Persisted

`Campaign.amount_earned` is `DataTypes.VIRTUAL` — it computes earnings on the fly.
`payment.js createPayout()` called `campaign.update({ amount_earned: ... })` which
Sequelize silently ignores. The `Payout` records are created correctly, but the
accumulated earnings tracking via virtual field writes was a no-op.

The `amount_withdrawn` field on Campaign correctly persists and is the real source of
truth for the withdrawal flow. The `createPayout` / `processPayout` flow in
`payment.js` is a separate (currently broken) path. Do not rely on it until the
virtual field issue is resolved by adding a real `amount_earned` column.

### 11. Currency Mismatch in Payouts UI — Code Change: YES (done)

`Payouts.tsx` displayed amounts with `€` (Euro) but the backend processes in `USD`.
Fixed to `$`.

### 12. Frontend `.env` Pointed to Localhost — Env Change: Yes

`VITE_API_BASE_URL=http://localhost:5000/api` will make production users' browsers
hit localhost (their own machine). Set this to your Railway backend URL in your
frontend deployment environment.

---

## Infrastructure & Hosting

### 13. Railway — Subscription Upgrade Required

No code changes needed. Railway's hobby tier sleeps on inactivity, causing 10–30 second
cold starts on the first request — unacceptable for a paying customer.

**Action:** Upgrade to Railway Pro (~$20/month). Set all env vars in the Railway
dashboard. Use the Railway-provided URL as your `BASE_URL` / backend domain.

### 14. Supabase — Tier Upgrade Required

The free tier pauses after 7 days of inactivity and has shared compute. You are storing
financial transaction data.

**Action:** Upgrade to Supabase Pro (~$25/month) for dedicated compute, no pausing,
and daily automated backups with point-in-time recovery.

### 15. `sequelize.sync()` Is Not a Production Migration Strategy

`sequelize.sync({ force: false })` runs on every server start. For production, schema
changes should be handled by `sequelize-cli` migrations run as part of the deploy
pipeline (`npx sequelize-cli db:migrate`). The `sync()` call is safe to leave for now
but should be replaced before any schema changes are needed.

### 16. `sharp` in `node_modules` — Verify Dependency

`sharp` appears in `node_modules` but not in `package.json` dependencies. It was likely
installed accidentally. It dramatically increases build size and compile time. Run
`npm ls sharp` to confirm it is not a transitive dependency, then clean install.

---

## Operational Readiness

### 17. No Rate Limiting — Code Change: YES (done)

The login endpoint had no brute-force protection. Added `express-rate-limit` to
`/api/auth/login` (max 10 requests per 15 minutes per IP) and a general API limiter
(100 req/15 min per IP).

### 18. No Request Logging — Code Change: YES (done)

`morgan` was in dependencies but not mounted. Added `app.use(morgan('combined'))` for
production and `morgan('dev')` for development.

### 19. JWT Tokens Are 7 Days With No Refresh

Tokens expire in 7 days with no refresh flow. When expired, users are hard-logged-out.
The `is_active` check on every request provides soft revocation. This is acceptable
short-term but a refresh token flow should be implemented before scale.

### 20. No Email Verification

`email.js` is empty. `email_verified` exists on the User model but is never set.
Brands can register with fake emails and charge cards. Implement email verification
(Resend or SendGrid) before public launch.

---

## Summary Checklist

| Priority | Action | Type | Status |
|---|---|---|---|
| Immediate | Rotate all exposed secrets | Infra | Manual action required |
| Immediate | Verify .env in .gitignore | Config | Done in this commit |
| Before first charge | Switch to Stripe live keys | Env | Manual action required |
| Before first charge | Set VITE_STRIPE_PUBLISHABLE_KEY | Env | Manual action required |
| Before first charge | Set STRIPE_WEBHOOK_SECRET | Env | Manual action required |
| Before first charge | Stripe webhook endpoint | Code | Done |
| Before first charge | Fix stripe_connect_account_id field | Code | Done |
| Before first charge | Fix user_type missing from JWT | Code | Done |
| Before first charge | Add campaign ownership checks | Code | Done |
| Before first charge | Fix confirmCampaignFunding verification | Code | Done via webhook |
| Before launch | Upgrade Railway to Pro | Infra | Manual action required |
| Before launch | Upgrade Supabase to Pro | Infra | Manual action required |
| Before launch | Set VITE_API_BASE_URL to prod URL | Env | Manual action required |
| Before launch | Fix Euro to Dollar in Payouts UI | Code | Done |
| Before launch | Add rate limiting | Code | Done |
| Before launch | Add morgan logging | Code | Done |
| Before launch | Protect admin endpoint | Code | Done |
| Near-term | Fix amount_earned virtual field | Code | Pending |
| Near-term | Add idempotency keys to transfers | Code | Pending |
| Near-term | Stripe transfer settlement delay | Code | Pending |
| Near-term | Switch to sequelize-cli migrations | Code | Pending |
| Near-term | Implement email verification | Code | Pending |
| Near-term | Implement refresh token flow | Code | Pending |
