const { Contract, User, Campaign } = require("../models");
const { Op } = require("sequelize");

// Create new contract (brands only)
const createContract = async (req, res) => {
  try {
    const {
      title,
      description,
      cpm_rate,
      max_payout,
      min_views,
      target_audience,
      content_requirements,
      platform,
      company_charge,
      expires_at,
    } = req.body;

    // Validation
    if (!title || !cpm_rate || !max_payout) {
      return res.status(400).json({
        error: "Title, CPM rate, and max payout are required",
      });
    }

    if (cpm_rate <= 0 || max_payout <= 0) {
      return res.status(400).json({
        error: "CPM rate and max payout must be positive numbers",
      });
    }

    // Create contract
    const contract = await Contract.create({
      brand_id: req.user.userId,
      title,
      description,
      cpm_rate,
      max_payout,
      min_views: min_views || 1000,
      target_audience,
      content_requirements,
      platform: platform || "tiktok",
      company_charge,
      expires_at: expires_at ? new Date(expires_at) : null,
    });

    // Include brand info in response
    const contractWithBrand = await Contract.findByPk(contract.id, {
      include: [
        {
          model: User,
          as: "brand",
          attributes: ["id", "company_name", "first_name", "last_name"],
        },
      ],
    });

    res.status(201).json({
      message: "Contract created successfully",
      contract: contractWithBrand,
    });
  } catch (error) {
    console.error("Create contract error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get contracts (different views for brands vs creators)
const getContracts = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const { status, platform, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter options
    if (status) where.status = status;
    if (platform) where.platform = platform;

    let contracts;
    let totalCount;

    if (user.user_type === "brand") {
      // Brands see their own contracts
      where.brand_id = req.user.userId;

      const result = await Contract.findAndCountAll({
        where,
        include: [
          {
            model: Campaign,
            as: "campaigns",
            include: [
              {
                model: User,
                as: "creator",
                attributes: ["id", "first_name", "last_name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset,
      });

      contracts = result.rows;
      totalCount = result.count;
    } else {
      // Creators see active contracts from other users
      where.status = "active";
      where.brand_id = { [Op.ne]: req.user.userId };

      // Don't show contracts they've already accepted
      const acceptedContractIds = await Campaign.findAll({
        where: { creator_id: req.user.userId },
        attributes: ["contract_id"],
      }).then((campaigns) => campaigns.map((c) => c.contract_id));

      if (acceptedContractIds.length > 0) {
        where.id = { [Op.notIn]: acceptedContractIds };
      }

      const result = await Contract.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "brand",
            attributes: ["id", "company_name", "first_name", "last_name"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset,
      });

      contracts = result.rows;
      totalCount = result.count;
    }

    res.json({
      contracts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get contracts error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get single contract
const getContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: User,
          as: "brand",
          attributes: ["id", "company_name", "first_name", "last_name"],
        },
        {
          model: Campaign,
          as: "campaigns",
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["id", "first_name", "last_name"],
            },
          ],
        },
      ],
    });

    if (!contract) {
      return res.status(404).json({
        error: "Contract not found",
      });
    }

    res.json({ contract });
  } catch (error) {
    console.error("Get contract error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Update contract (brands only, own contracts)
const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contract = await Contract.findOne({
      where: {
        id,
        brand_id: req.user.userId,
      },
    });

    if (!contract) {
      return res.status(404).json({
        error: "Contract not found or access denied",
      });
    }

    await contract.update(updates);

    const updatedContract = await Contract.findByPk(id, {
      include: [
        {
          model: User,
          as: "brand",
          attributes: ["id", "company_name", "first_name", "last_name"],
        },
      ],
    });

    res.json({
      message: "Contract updated successfully",
      contract: updatedContract,
    });
  } catch (error) {
    console.error("Update contract error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Accept contract (creators only)
const acceptContract = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contract exists and is active
    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({
        error: "Contract not found",
      });
    }

    if (contract.status !== "active") {
      return res.status(400).json({
        error: "Contract is not available",
      });
    }

    // Check if creator already accepted this contract
    const existingCampaign = await Campaign.findOne({
      where: {
        contract_id: id,
        creator_id: req.user.userId,
      },
    });

    if (existingCampaign) {
      return res.status(400).json({
        error: "You have already accepted this contract",
      });
    }

    // Create campaign
    const campaign = await Campaign.create({
      contract_id: id,
      creator_id: req.user.userId,
      status: "accepted",
      max_payout: contract.max_payout / contract.num_campaigns,
    });

    res.json({
      message: "Contract accepted successfully",
      campaign,
    });
  } catch (error) {
    console.error("Accept contract error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

module.exports = {
  createContract,
  getContracts,
  getContract,
  updateContract,
  acceptContract,
};
