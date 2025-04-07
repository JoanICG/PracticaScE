const express = require("express");
const { 
  register, 
  login, 
  logout,
  getProfile, 
  verifyAuth 
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { preventRoleAssignment } = require("../middleware/validation.middleware");

const router = express.Router();

// Rutas públicas
router.post("/register", preventRoleAssignment, register);
router.post("/login", login);
router.post("/logout", logout);

// Rutas protegidas
router.get("/profile", authMiddleware, getProfile);
router.get("/verify", authMiddleware, verifyAuth);

module.exports = router;