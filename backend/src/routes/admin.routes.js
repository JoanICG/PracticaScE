const express = require("express");
const { 
  getAllUsers, 
  getAllOrders, 
  updateOrderStatus 
} = require("../controllers/admin.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const { checkRole } = require("../middleware/role.middleware");

const router = express.Router();

router.get('/users', authMiddleware, checkRole(['admin']), getAllUsers);
router.get('/orders', authMiddleware, checkRole(['admin']), getAllOrders);
router.put('/orders/update-status', authMiddleware, checkRole(['admin']), updateOrderStatus);

module.exports = router;