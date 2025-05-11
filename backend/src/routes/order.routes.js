const express = require("express");
const { createOrder, getUserOrders } = require("../controllers/order.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// Todas las rutas de pedidos requieren autenticación
router.use(authMiddleware);

router.post("/create", createOrder);
router.get("/my-orders", getUserOrders);

module.exports = router;