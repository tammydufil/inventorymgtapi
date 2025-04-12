const { sequelize } = require("../models");

const getAllProductTypes = async (req, res) => {
  try {
    const [productTypes] = await sequelize.query(
      "SELECT `id`, `name`, `status` FROM `producttypes` WHERE 1"
    );

    if (productTypes.length === 0) {
      return res.status(404).json({ message: "No product types found" });
    }

    res.status(200).json({ productTypes });
  } catch (error) {
    console.error("Error fetching product types:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch product types", error: error.message });
  }
};

const getActiveProductTypes = async (req, res) => {
  try {
    const [activeProductTypes] = await sequelize.query(
      "SELECT `id`, `name`, `status` FROM `producttypes` WHERE `status` = 'active'"
    );

    if (activeProductTypes.length === 0) {
      return res.status(404).json({ message: "No active product types found" });
    }

    res.status(200).json({ activeProductTypes });
  } catch (error) {
    console.error("Error fetching active product types:", error);
    res.status(500).json({
      message: "Failed to fetch active product types",
      error: error.message,
    });
  }
};

const deleteProductType = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await sequelize.query(
      "DELETE FROM `producttypes` WHERE `id` = :id",
      {
        replacements: { id },
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product type not found" });
    }

    res.status(200).json({ message: "Product type deleted successfully" });
  } catch (error) {
    console.error("Error deleting product type:", error);
    res
      .status(500)
      .json({ message: "Failed to delete product type", error: error.message });
  }
};

const getProductTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const [productType] = await sequelize.query(
      "SELECT `id`, `name`, `status` FROM `producttypes` WHERE `id` = :id",
      {
        replacements: { id },
      }
    );

    if (productType.length === 0) {
      return res.status(404).json({ message: "Product type not found" });
    }

    res.status(200).json({ productType: productType[0] });
  } catch (error) {
    console.error("Error fetching product type by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch product type", error: error.message });
  }
};

const addProductType = async (req, res) => {
  try {
    const { name, status } = req.body; // Destructure the name and status from the request body

    // Validate input data
    if (!name || !status) {
      return res
        .status(400)
        .json({ message: "Product type name and status are required" });
    }

    // Use sequelize.query to insert a new product type
    const [result] = await sequelize.query(
      "INSERT INTO `producttypes` (`name`, `status`) VALUES (:name, :status)",
      {
        replacements: { name, status }, // Replace placeholders with actual values
        type: sequelize.QueryTypes.INSERT, // Indicate it's an insert query
      }
    );

    res.status(201).json({
      message: "Product type added successfully",
      productType: { name, status }, // Return the newly added product type
    });
  } catch (error) {
    console.log("Error adding product type:", error);
    res.status(500).json({
      message: "Failed to add product type",
      error: error.message,
    });
  }
};
const updateProductType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    // Validate input
    if (!name || !status) {
      return res.status(400).json({ message: "Name and status are required" });
    }

    // Check if product type exists
    const [existingRows] = await sequelize.query(
      "SELECT id FROM `producttypes` WHERE id = :id",
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Product type not found" });
    }

    // Update product type
    const [result] = await sequelize.query(
      "UPDATE `producttypes` SET `name` = :name, `status` = :status WHERE `id` = :id",
      {
        replacements: { id, name, status },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      message: "Product type updated successfully",
      productType: { id, name, status },
    });
  } catch (error) {
    console.error("Error updating product type:", error);
    res.status(500).json({
      message: "Failed to update product type",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProductTypes,
  getActiveProductTypes,
  deleteProductType,
  getProductTypeById,
  addProductType,
  updateProductType,
};
