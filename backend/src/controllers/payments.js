const PaymentService = require("../services/payment");

exports.fundContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const result = await PaymentService.fundContract(contractId);
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
