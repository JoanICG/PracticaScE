const express = require("express");
const { register, login, getProfile } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { preventRoleAssignment } = require("../middleware/validation.middleware");

const router = express.Router();

// Rutas públicas
router.post("/register", preventRoleAssignment, register);
router.post("/login", login);

// Rutas protegidas
router.get("/profile", authMiddleware, getProfile);

module.exports = router;