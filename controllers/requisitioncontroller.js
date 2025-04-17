const { sequelize } = require("../models");

const createRequisition = async (req, res) => {
  try {
    const { items, approver, sentby, sentbyname } = req.body;

    if (!items || Object.keys(items).length === 0) {
      return res
        .status(400)
        .json({ message: "No requisition items provided." });
    }

    if (!approver) {
      return res.status(400).json({ message: "Approver is required." });
    }

    // Convert object to array
    const itemsArray = Object.values(items);

    // Generate a simple reqid using timestamp + random number
    const reqid = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const insertPromises = itemsArray.map((item) => {
      const { category, name: material, quantity, note } = item;

      const sql = `
          INSERT INTO requisition (reqid, category, material, quantity, note, approval, sentby, sentbyname)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

      const values = [
        reqid,
        category,
        material,
        quantity,
        note,
        approver,
        sentby,
        sentbyname,
      ];

      return sequelize.query(sql, { replacements: values });
    });

    await Promise.all(insertPromises);

    return res.status(201).json({
      message: "Requisition items created successfully.",
      reqid,
    });
  } catch (error) {
    console.error("Error creating requisitions:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getPendingApprovals = async (req, res) => {
  const { userId } = req.body;

  try {
    const pendingApprovals = await sequelize.query(
      `SELECT id, reqid, category, material, quantity, note, approval, status, sentby, sentbyname, date
         FROM requisition 
         WHERE approval = :userId AND status = 'false'`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!pendingApprovals || pendingApprovals.length === 0) {
      return res.status(404).json({
        message: "No pending approvals found for this user",
      });
    }

    // Grouping by reqid
    const grouped = pendingApprovals.reduce((acc, item) => {
      if (!acc[item.reqid]) {
        acc[item.reqid] = {
          reqid: item.reqid,
          approval: item.approval,
          status: item.status,
          sentby: item.sentby,
          sentbyname: item.sentbyname,
          date: item.date,
          items: [],
        };
      }
      acc[item.reqid].items.push({
        id: item.id,
        category: item.category,
        material: item.material,
        quantity: item.quantity,
        note: item.note,
      });
      return acc;
    }, {});

    // Convert object to array
    const groupedArray = Object.values(grouped);

    return res.status(200).json(groupedArray);
  } catch (err) {
    console.error("Error fetching pending approvals:", err);
    return res.status(500).json({
      message: "Server Error. Could not fetch pending approvals.",
      error: err.message,
    });
  }
};

const approveOrRejectRequest = async (req, res) => {
  const { reqid, action } = req.body;

  if (!reqid || !action || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid request parameters." });
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  const transaction = await sequelize.transaction();
  try {
    if (action === "approve") {
      // 1. Fetch all requisition items for the given reqid
      const requisitionItems = await sequelize.query(
        `SELECT material, quantity FROM requisition WHERE reqid = ?`,
        {
          replacements: [reqid],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      // 2. Update materials value
      for (const item of requisitionItems) {
        await sequelize.query(
          `UPDATE materials
             SET value = value + ?
             WHERE name = ?`,
          {
            replacements: [item.quantity, item.material],
            type: sequelize.QueryTypes.UPDATE,
            transaction,
          }
        );
      }
    }

    // 3. Update requisition status
    await sequelize.query(`UPDATE requisition SET status = ? WHERE reqid = ?`, {
      replacements: [newStatus, reqid],
      type: sequelize.QueryTypes.UPDATE,
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      message: `Requisition ${newStatus} successfully.`,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error approving/rejecting requisition:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const getApprovalsByDateRange = async (req, res) => {
  const { userId, startDate, endDate } = req.body;

  // Basic validation
  if (!userId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Missing required parameters: userId, startDate, endDate",
    });
  }

  try {
    const approvals = await sequelize.query(
      `
          SELECT id, reqid, category, material, quantity, note, approval, status, sentby, sentbyname, date
          FROM requisition
          WHERE approval = :userId
            AND DATE(date) BETWEEN :startDate AND :endDate
          ORDER BY date DESC
        `,
      {
        replacements: { userId, startDate, endDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log(approvals);

    if (approvals.length === 0) {
      return res.status(404).json({
        message: "No approvals found for the given date range.",
      });
    }

    // Grouping by reqid
    const grouped = approvals.reduce((acc, item) => {
      if (!acc[item.reqid]) {
        acc[item.reqid] = {
          reqid: item.reqid,
          approval: item.approval,
          status: item.status,
          sentby: item.sentby,
          sentbyname: item.sentbyname,
          date: item.date,
          items: [],
        };
      }
      acc[item.reqid].items.push({
        id: item.id,
        category: item.category,
        material: item.material,
        quantity: item.quantity,
        note: item.note,
      });
      return acc;
    }, {});

    // Convert object to array and return the response
    const groupedArray = Object.values(grouped);

    return res.status(200).json(groupedArray);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return res.status(500).json({
      message: "Server Error. Could not fetch approvals.",
      error: error.message,
    });
  }
};
const getMyApprovalsByDateRange = async (req, res) => {
  const { userId, startDate, endDate } = req.body;

  // Basic validation
  if (!userId || !startDate || !endDate) {
    return res.status(400).json({
      message: "Missing required parameters: userId, startDate, endDate",
    });
  }

  try {
    const approvals = await sequelize.query(
      `
         SELECT 
            r.id, r.reqid, r.category, r.material, r.quantity, r.note, 
            r.approval, r.status, r.sentby, r.sentbyname, r.date,
            u.Fullname AS Fullname
          FROM requisition r
          LEFT JOIN users u ON u.email = r.approval
          WHERE r.sentby = :userId and DATE(r.date) BETWEEN :startDate AND :endDate
          ORDER BY r.date DESC
        `,

      {
        replacements: { userId, startDate, endDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    console.log(approvals);

    if (approvals.length === 0) {
      return res.status(404).json({
        message: "No approvals found for the given date range.",
      });
    }

    // Grouping by reqid
    const grouped = approvals.reduce((acc, item) => {
      if (!acc[item.reqid]) {
        acc[item.reqid] = {
          reqid: item.reqid,
          approval: item.approval,
          status: item.status,
          sentby: item.sentby,
          sentbyname: item.sentbyname,
          date: item.date,
          items: [],
        };
      }
      acc[item.reqid].items.push({
        id: item.id,
        category: item.category,
        material: item.material,
        quantity: item.quantity,
        note: item.note,
      });
      return acc;
    }, {});

    // Convert object to array and return the response
    const groupedArray = Object.values(grouped);

    return res.status(200).json(groupedArray);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return res.status(500).json({
      message: "Server Error. Could not fetch approvals.",
      error: error.message,
    });
  }
};

const getAllApprovalsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(400).json({
      message: "Missing required parameters: startDate and endDate",
    });
  }

  try {
    const approvals = await sequelize.query(
      `
          SELECT 
            r.id, r.reqid, r.category, r.material, r.quantity, r.note, 
            r.approval, r.status, r.sentby, r.sentbyname, r.date,
            u.Fullname AS Fullname
          FROM requisition r
          LEFT JOIN users u ON u.email = r.approval
          WHERE DATE(r.date) BETWEEN :startDate AND :endDate
          ORDER BY r.date DESC
        `,
      {
        replacements: { startDate, endDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!approvals || approvals.length === 0) {
      return res.status(404).json({
        message: "No approval requests found in the given date range.",
      });
    }

    // Group by reqid
    const grouped = approvals.reduce((acc, item) => {
      if (!acc[item.reqid]) {
        acc[item.reqid] = {
          reqid: item.reqid,
          approval: item.approval,
          Fullname: item.Fullname, // Include approver email here
          status: item.status,
          sentby: item.sentby,
          sentbyname: item.sentbyname,
          date: item.date,
          items: [],
        };
      }
      acc[item.reqid].items.push({
        id: item.id,
        category: item.category,
        material: item.material,
        quantity: item.quantity,
        note: item.note,
      });
      return acc;
    }, {});

    const groupedArray = Object.values(grouped);

    return res.status(200).json(groupedArray);
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    return res.status(500).json({
      message: "Server error while fetching approval requests.",
      error: error.message,
    });
  }
};

module.exports = {
  createRequisition,
  getPendingApprovals,
  approveOrRejectRequest,
  getApprovalsByDateRange,
  getAllApprovalsByDateRange,
  getMyApprovalsByDateRange,
};
