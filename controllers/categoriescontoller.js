const { sequelize } = require("../models");

const getAllCategories = async (req, res) => {
  try {
    const [categories] = await sequelize.query(
      "SELECT id, name, status FROM categories WHERE 1"
    );

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const getActiveCategories = async (req, res) => {
  try {
    const [activeCategories] = await sequelize.query(
      "SELECT id, name, status FROM categories WHERE status = 'active'"
    );

    if (activeCategories.length === 0) {
      return res.status(404).json({ message: "No active categories found" });
    }

    res.status(200).json({ activeCategories });
  } catch (error) {
    console.error("Error fetching active categories:", error);
    res.status(500).json({
      message: "Failed to fetch active categories",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const [category] = await sequelize.query(
      "SELECT id, name, status FROM categories WHERE id = :id",
      {
        replacements: { id },
      }
    );

    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category: category[0] });
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name || !status) {
      return res
        .status(400)
        .json({ message: "Category name and status are required" });
    }

    const [result] = await sequelize.query(
      "INSERT INTO categories (name, status) VALUES (:name, :status)",
      {
        replacements: { name, status },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      message: "Category added successfully",
      category: { name, status },
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      message: "Failed to add category",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name || !status) {
      return res.status(400).json({ message: "Name and status are required" });
    }

    const [existingRows] = await sequelize.query(
      "SELECT id FROM categories WHERE id = :id",
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const [result] = await sequelize.query(
      "UPDATE categories SET name = :name, status = :status WHERE id = :id",
      {
        replacements: { id, name, status },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    res.status(200).json({
      message: "Category updated successfully",
      category: { id, name, status },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await sequelize.query(
      "DELETE FROM categories WHERE id = :id",
      {
        replacements: { id },
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
