const express = require("express");
const { createInitialAdmin } = require("../controllers/system.controller");

const router = express.Router();

// Ruta especial para creación inicial de administradores
// Solo debe ser usada con Postman o similar
router.post("/create-admin", createInitialAdmin);

module.exports = router;