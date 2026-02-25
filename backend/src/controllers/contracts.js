const { Contract, User, Campaign } = require("../models");
const { Op } = require("sequelize");
const { generateEmbedding, cosineSimilarity } = require("../services/embedding");

// Create new contract (brands only)
const createContract = async (req, res) => {
  try {
    const {
      title,
      description,
      cpm_rate,
      max_payout,
      min_views,
      platform,
      company_charge,
      expires_at,
    } = req.body;

    if (!title || !cpm_rate || !max_payout || !description) {
      return res.status(400).json({
        error: "Title, description, CPM rate, and max payout are required",
      });
    }

    if (cpm_rate <= 0 || max_payout <= 0) {
      return res.status(400).json({
        error: "CPM rate and max payout must be positive numbers",
      });
    }

    // Generate embedding before inserting so the record is complete from the start
    const description_embedding = await generateEmbedding(description);

    const contract = await Contract.create({
      brand_id: req.user.userId,
      title,
      description,
      description_embedding,
      cpm_rate,
      max_payout,
      min_views: min_views || 1000,
      platform: platform || "tiktok",
      company_charge,
      expires_at: expires_at ? new Date(expires_at) : null,
    });

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
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get contracts (different views for brands vs creators)
const getContracts = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const { status, platform } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (platform) where.platform = platform;

    let contracts;
    let totalCount;

    if (user.user_type === "brand") {
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
      where.status = "active";
      where.brand_id = { [Op.ne]: req.user.userId };

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
    res.status(500).json({ error: "Internal server error" });
  }
};

// Count active contracts available to creators
const getNumAvailableContracts = async (req, res) => {
  try {
    const now = new Date();
    const contracts = await Contract.findAll({
      where: {
        status: "active",
        [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
      },
      include: [
        {
          model: Campaign,
          as: "campaigns",
          required: false,
        },
      ],
    });

    const availableContracts = contracts.filter((contract) => {
      const numCampaigns = contract.campaigns ? contract.campaigns.length : 0;
      return numCampaigns < contract.num_campaigns;
    });

    res.json({ count: availableContracts.length });
  } catch (error) {
    console.error("Get number of contracts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get recommended contracts for the requesting creator via cosine similarity
const getRecommendedContracts = async (req, res) => {
  try {
    const creator = await User.findByPk(req.user.userId);

    if (!creator.about_me_embedding) {
      return res.status(400).json({
        error:
          "Set an About Me in your profile to get personalised recommendations",
      });
    }

    const creatorVec = creator.about_me_embedding;
    const now = new Date();

    // Use the same availability filter as getContracts (creator path)
    const acceptedContractIds = await Campaign.findAll({
      where: { creator_id: req.user.userId },
      attributes: ["contract_id"],
    }).then((campaigns) => campaigns.map((c) => c.contract_id));

    const where = {
      status: "active",
      brand_id: { [Op.ne]: req.user.userId },
      [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gt]: now } }],
    };

    if (acceptedContractIds.length > 0) {
      where.id = { [Op.notIn]: acceptedContractIds };
    }

    const contracts = await Contract.findAll({
      where,
      include: [
        {
          model: User,
          as: "brand",
          attributes: ["id", "company_name", "first_name", "last_name"],
        },
      ],
    });

    const scored = contracts
      .filter((c) => c.description_embedding)
      .map((c) => {
        const score = cosineSimilarity(creatorVec, c.description_embedding);
        return { ...c.toJSON(), similarity_score: score };
      })
      .filter((c) => c.similarity_score > 0.5)
      .sort((a, b) => b.similarity_score - a.similarity_score);

    res.json({ contracts: scored });
  } catch (error) {
    console.error("Get recommended contracts error:", error);
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json({ contract });
  } catch (error) {
    console.error("Get contract error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update contract (brands only, own contracts)
const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const contract = await Contract.findOne({
      where: { id, brand_id: req.user.userId },
    });

    if (!contract) {
      return res.status(404).json({
        error: "Contract not found or access denied",
      });
    }

    // Re-generate embedding when description changes
    if (updates.description) {
      updates.description_embedding = await generateEmbedding(
        updates.description
      );
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
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept contract (creators only)
const acceptContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    if (contract.status !== "active") {
      return res.status(400).json({ error: "Contract is not available" });
    }

    const existingCampaign = await Campaign.findOne({
      where: { contract_id: id, creator_id: req.user.userId },
    });

    if (existingCampaign) {
      return res
        .status(400)
        .json({ error: "You have already accepted this contract" });
    }

    const campaign = await Campaign.create({
      contract_id: id,
      creator_id: req.user.userId,
      status: "accepted",
      max_payout: contract.max_payout / contract.num_campaigns,
    });

    res.json({ message: "Contract accepted successfully", campaign });
  } catch (error) {
    console.error("Accept contract error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createContract,
  getNumAvailableContracts,
  getContracts,
  getRecommendedContracts,
  getContract,
  updateContract,
  acceptContract,
};
