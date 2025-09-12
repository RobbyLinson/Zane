const PaymentService = require("../services/payment");

exports.fundContractDraft = async (req, res) => {
  try {
    const contractDraft = req.body; // All contract fields
    const result = await PaymentService.fundContractDraft(
      contractDraft,
      req.user.userId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.confirmCampaignFunding = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const result = await PaymentService.confirmCampaignFunding(campaignId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateViews = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { newViewCount } = req.body;
    const result = await PaymentService.updateViews(campaignId, newViewCount);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createPayout = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const result = await PaymentService.createPayout(campaignId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.processPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const result = await PaymentService.processPayout(payoutId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
