const { sequelize } = require("../models");

const getAllPurchases = async (req, res) => {
  const { startdate, enddate } = req.query;

  try {
    let query = `
        SELECT batch_id, GROUP_CONCAT(id) as ids, 
               GROUP_CONCAT(material) as materials, 
               GROUP_CONCAT(quantity) as quantities, 
               uploaded_by as uploaded_by, 
               date as dates
        FROM purchase
      `;

    // Add date filtering if startdate and enddate are provided
    if (startdate && enddate) {
      query += `
          WHERE date BETWEEN '${startdate}' AND '${enddate}'
        `;
    }

    query += `
        GROUP BY batch_id
        ORDER BY date DESC
      `;

    const [purchases] = await sequelize.query(query);

    // Process the query result into a structured array of purchases
    const groupedPurchases = purchases.map((purchase) => {
      console.log(purchase);

      const ids = purchase.ids.split(",");
      const materials = purchase.materials.split(",");
      const quantities = purchase.quantities.split(",");
      const uploadedBy = purchase.uploaded_by.split(",");
      const dates = purchase.dates
        ? purchase.dates.toISOString().split("T")
        : [];

      const purchases = ids.map((id, index) => ({
        id,
        material: materials[index],
        quantity: quantities[index],
        uploaded_by: uploadedBy[index],
        date: dates[index],
      }));

      return {
        batch_id: purchase.batch_id,
        purchases,
      };
    });

    res.status(200).json({ purchases: groupedPurchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Failed to fetch purchases" });
  }
};

const createPurchases = async (req, res) => {
  const { items, uploaded_by } = req.body;

  if (!Array.isArray(items) || items.length === 0 || !uploaded_by) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    const transaction = await sequelize.transaction();

    try {
      // Generate a random batch ID
      const batch_id = `batch_${Math.random().toString(36).substr(2, 9)}`;

      for (const item of items) {
        const materialName = item["Material Name"];
        const quantity = parseFloat(item.Quantity);

        if (!materialName || isNaN(quantity)) {
          throw new Error(`Invalid data for material: ${JSON.stringify(item)}`);
        }

        // Fetch current value from materials
        const [result] = await sequelize.query(
          `SELECT value FROM materials WHERE name = :materialName LIMIT 1`,
          {
            replacements: { materialName },
            transaction,
          }
        );

        const currentValue = result[0]?.value ?? 0;
        const newValue = (parseFloat(currentValue) || 0) + quantity;

        // Update the material's value
        await sequelize.query(
          `UPDATE materials SET value = :newValue WHERE name = :materialName`,
          {
            replacements: { newValue, materialName },
            transaction,
          }
        );

        // Insert purchase record
        await sequelize.query(
          `INSERT INTO purchase (material, quantity, uploaded_by, batch_id)
           VALUES (:materialName, :quantity, :uploadedBy, :batchId)`,
          {
            replacements: {
              materialName,
              quantity,
              uploadedBy: uploaded_by.replace(/'/g, "''"),
              batchId: batch_id,
            },
            transaction,
          }
        );
      }

      await transaction.commit();
      res
        .status(201)
        .json({ message: "Purchases created and inventory updated", batch_id });
    } catch (error) {
      await transaction.rollback();
      console.error("Error during purchases creation:", error);
      res.status(500).json({ message: "Failed to create purchases" });
    }
  } catch (error) {
    console.error("Error starting transaction:", error);
    res.status(500).json({ message: "Failed to start transaction" });
  }
};
const getUserModulesByEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const [results] = await sequelize.query(
      `
      SELECT userId, FullName, Email, Designation, Department, Modules, canApprove
      FROM users
      WHERE Email = :email
      `,
      {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!results) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching user modules:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching user modules." });
  }
};

module.exports = {
  getAllPurchases,
  createPurchases,
  getUserModulesByEmail,
};
