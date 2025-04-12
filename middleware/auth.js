const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = "your_jwt_secret";

const authenticateUser = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  //   console.log(req.path);

  if (req.path === "/inventorymgtapi/api/loginUser") {
    return next();
  }

  if (!token) {
    return res
      .status(403)
      .json({ message: "No token provided, access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
