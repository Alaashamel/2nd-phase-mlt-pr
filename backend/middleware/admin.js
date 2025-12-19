const jwt = require("jsonwebtoken");

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No admin token provided" });
    }

    // For demo purposes, accept any admin token
    // In production, verify against admin user database
    if (token.startsWith("admin-token-")) {
      req.admin = { id: "admin", role: "administrator" };
      next();
    } else {
      res.status(401).json({ message: "Invalid admin token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid admin token" });
  }
};

module.exports = adminAuth;
