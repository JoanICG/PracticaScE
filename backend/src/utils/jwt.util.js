const jwt = require("jsonwebtoken");
require("dotenv").config();

// Utiidad para generar y verificar tokens JWT
const generateToken = (userData) => {
  return jwt.sign(
    userData,
    process.env.JWT_SECRET || "your_jwt_secret_key",
    { expiresIn: process.env.JWT_EXPIRATION || "1h" }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
};

module.exports = { generateToken, verifyToken };