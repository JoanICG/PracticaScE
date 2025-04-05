const express = require("express");
const { addToCart, getCart, updateCartItem } = require("../controllers/cart.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// Todas las rutas de carrito requieren autenticación
router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update-item", updateCartItem);

module.exports = router;