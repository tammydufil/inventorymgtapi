const { QueryTypes } = require("sequelize");
const { sequelize } = require("../models");

// Get all materials
const getAllMaterials = async (req, res) => {
  try {
    const [materials] = await sequelize.query(
      "SELECT * FROM `materials` WHERE 1"
    );
    res.status(200).json({ materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Server error while fetching materials." });
  }
};

// Get a material by ID
const getMaterialById = async (req, res) => {
  const { id } = req.params;
  try {
    const [material] = await sequelize.query(
      "SELECT `id`, `name`, `productType`, `category`, `unit`, `sku`, `minimum`, `description` FROM `materials` WHERE `id` = ?",
      { replacements: [id] }
    );

    if (!material.length) {
      return res.status(404).json({ message: "Material not found." });
    }

    res.status(200).json({ material: material[0] });
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).json({ message: "Server error while fetching material." });
  }
};

// Add a new material
const addMaterial = async (req, res) => {
  const { name, productType, category, unit, sku, minimum, description } =
    req.body;

  try {
    // Check if a material with the same name already exists
    const [existing] = await sequelize.query(
      "SELECT id FROM materials WHERE name = ?",
      {
        replacements: [name],
      }
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Material name already exists." });
    }

    // Insert new material
    await sequelize.query(
      "INSERT INTO `materials` (`name`, `productType`, `category`, `unit`, `sku`, `minimum`, `description`) VALUES (?, ?, ?, ?, ?, ?, ?)",
      {
        replacements: [
          name,
          productType,
          category,
          unit,
          sku,
          minimum,
          description,
        ],
      }
    );

    res.status(201).json({ message: "Material created successfully." });
  } catch (error) {
    console.error("Error adding material:", error);
    res.status(500).json({ message: "Server error while adding material." });
  }
};

// Update a material
const updateMaterial = async (req, res) => {
  const { name, productType, category, unit, sku, minimum, description, id } =
    req.body;

  try {
    console.log(id);

    const [result] = await sequelize.query(
      "UPDATE `materials` SET `name` = ?, `productType` = ?, `category` = ?, `unit` = ?, `sku` = ?, `minimum` = ?, `description` = ? WHERE `id` = ?",
      {
        replacements: [
          name,
          productType,
          category,
          unit,
          sku,
          minimum,
          description,
          id,
        ],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Material not found." });
    }

    res.status(200).json({ message: "Material updated successfully." });
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ message: "Server error while updating material." });
  }
};

const deleteMaterial = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await sequelize.query(
      "DELETE FROM `materials` WHERE `id` = ?",
      { replacements: [id] }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Material not found." });
    }

    res.status(200).json({ message: "Material deleted successfully." });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Server error while deleting material." });
  }
};

const getPurchaseHistory = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { startDate, endDate } = req.query;

    if (!materialId) {
      return res.status(400).json({ message: "Material ID is required" });
    }

    // Common replacements object
    const replacements = { materialId };
    let dateFilterClause = "";

    // Apply date filtering if provided
    if (startDate && endDate) {
      dateFilterClause = " AND date BETWEEN :startDate AND :endDate";
      replacements.startDate = startDate;
      replacements.endDate = endDate;
    }

    // Fetch purchase history
    const purchaseQuery = `
      SELECT id, material, quantity, uploaded_by, batch_id, date
      FROM purchase
      WHERE material = :materialId
      ${dateFilterClause}
      ORDER BY date DESC
    `;

    const purchases = await sequelize.query(purchaseQuery, {
      type: QueryTypes.SELECT,
      replacements,
    });

    // Fetch requisition history
    const requisitionQuery = `
      SELECT id, reqid, category, material, quantity, note, approval, status, sentby, sentbyname, date
      FROM requisition
      WHERE material = :materialId
      ${dateFilterClause}
      ORDER BY date DESC
    `;

    const requisitions = await sequelize.query(requisitionQuery, {
      type: QueryTypes.SELECT,
      replacements,
    });

    // Return both in one response
    return res.status(200).json({
      purchases,
      requisitions,
    });
  } catch (error) {
    console.error("Error fetching material history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMaterialStats = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) AS totalItems,
        SUM(CASE WHEN value = 0 THEN 1 ELSE 0 END) AS outOfStock,
        SUM(CASE WHEN value < minimum AND value > 0 THEN 1 ELSE 0 END) AS lowStock,
        SUM(CASE WHEN value >= minimum THEN 1 ELSE 0 END) AS inStock
      FROM materials
    `);

    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

const getLowAndOutOfStockItems = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT id, name, category, sku, value, minimum
      FROM materials
      WHERE value = 0 OR value < minimum
    `);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stock data" });
  }
};

const getLastFivePurchases = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT id, material, quantity, uploaded_by, batch_id, date
      FROM purchase
      ORDER BY date DESC
      LIMIT 5
    `);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching purchases" });
  }
};

// Export all controllers (not default)
module.exports = {
  getAllMaterials,
  getMaterialById,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  getPurchaseHistory,
  getMaterialStats,
  getLowAndOutOfStockItems,
  getLastFivePurchases,
};
