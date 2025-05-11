const express = require("express");
const { addToCart, getCart, updateCartItem } = require("../controllers/cart.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Todas las rutas de carrito requieren autenticación
router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update-item", updateCartItem); 

// Nueva ruta para crear un PaymentIntent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalAmount } = req.body;

    // Crear un PaymentIntent con el monto total
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), 
      currency: "eur",
      payment_method_types: ["card"],
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error al crear PaymentIntent:", error);
    res.status(500).json({ success: false, message: "Error al procesar el pago" });
  }
});

module.exports = router;