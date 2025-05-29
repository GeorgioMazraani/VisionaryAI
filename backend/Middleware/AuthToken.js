const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to verify JWT token from Authorization header
 * Format expected: "Bearer <token>"
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // lowercase "headers" is standard
  const token = authHeader && authHeader.split(" ")[1]; // supports "Bearer token"

  if (!token) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches user data to request object
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateToken;
