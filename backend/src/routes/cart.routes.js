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

// Nueva ruta para crear una sesión de Stripe Checkout (sin clave pública en frontend)
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { totalAmount } = req.body;
    if (!totalAmount || isNaN(totalAmount)) {
      return res.status(400).json({ success: false, message: "totalAmount inválido" });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: 'Pedido en tienda' },
            unit_amount: Math.round(Number(totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout?canceled=true`,
    });

    return res.status(200).json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Error al crear sesión de Checkout:", error);
    return res.status(500).json({ success: false, message: "Error al crear la sesión de pago" });
  }
});

module.exports = router;