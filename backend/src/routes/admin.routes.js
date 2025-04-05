const express = require("express");
const { 
  getAllUsers, 
  getAllOrders,
  getOrderById,
  updateOrderStatus 
} = require("../controllers/admin.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/users', authMiddleware, checkRole(['admin']), getAllUsers);

// Rutas para gestión de pedidos
router.get('/orders', authMiddleware, checkRole(['admin']), getAllOrders);
router.get('/orders/:id', authMiddleware, checkRole(['admin']), getOrderById);
router.put('/orders/update-status', authMiddleware, checkRole(['admin']), updateOrderStatus);

module.exports = router;