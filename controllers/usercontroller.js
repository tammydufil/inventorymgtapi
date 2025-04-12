const bcrypt = require("bcryptjs");
const { sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_jwt_secret";

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Fetch user by email
    const [results] = await sequelize.query(
      "SELECT * FROM users WHERE `Email` = :email",
      { replacements: { email } }
    );

    const user = results[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.Email,
        fullName: user.FullName,
        role: user.Designation,
        modules: user.Modules,
      },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user.userId,
        email: user.Email,
        fullName: user.FullName,
        designation: user.Designation,
        department: user.Department,
        modules: user.Modules,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const createUser = async (req, res) => {
  const {
    fullName,
    email,
    designation,
    department,
    password,
    modules,
    canApprove,
  } = req.body;

  if (
    !fullName ||
    !email ||
    !designation ||
    !department ||
    !password ||
    !modules ||
    !canApprove
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userId = `USR-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      `INSERT INTO users 
        (\`userId\`, \`FullName\`, \`Email\`, \`Designation\`, \`Department\`, \`Password\`, \`Modules\`, \`canApprove\` ) 
        VALUES (:userId, :fullName, :email, :designation, :department, :password, :modules, :canApprove)`,
      {
        replacements: {
          userId,
          fullName,
          email,
          designation,
          department,
          password: hashedPassword,
          modules,
          canApprove,
        },
      }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        userId,
        fullName,
        email,
        designation,
        department,
        modules,
        canApprove,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const [users] = await sequelize.query("SELECT * FROM users");

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};
const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const [users] = await sequelize.query(
      "SELECT * FROM users WHERE `userId` = :userId",
      {
        replacements: { userId },
      }
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    fullName,
    email,
    designation,
    department,
    modules,
    password,
    canApprove,
  } = req.body;

  try {
    let updateFields = [];
    let replacements = {
      fullName,
      email,
      designation,
      department,
      modules,
      userId,
      canApprove,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with a salt rounds of 10
      updateFields.push("`Password` = :password");
      replacements.password = hashedPassword;
    }

    // Ensure that there's no trailing comma before WHERE clause
    const sql = `
      UPDATE users SET
        \`FullName\` = :fullName,
        \`Email\` = :email,
        \`Designation\` = :designation,
        \`Department\` = :department,
        \`Modules\` = :modules,
         \`canApprove\` = :canApprove
        ${updateFields.length > 0 ? ", " + updateFields.join(", ") : ""}
      WHERE \`userId\` = :userId
    `;

    const [result] = await sequelize.query(sql, {
      replacements,
    });

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [result] = await sequelize.query(
      "DELETE FROM users WHERE `userId` = :userId",
      {
        replacements: { userId },
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
const getApprovallist = async (req, res) => {
  try {
    const [approvers] = await sequelize.query(`
      SELECT userId, FullName, Email, Designation, Department 
      FROM users 
      WHERE canApprove = 'true'
    `);

    res.status(200).json(approvers);
  } catch (error) {
    console.error("Error fetching approval list:", error);
    res.status(500).json({ error: "Failed to fetch approval list" });
  }
};

module.exports = {
  loginUser,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getApprovallist,
};
