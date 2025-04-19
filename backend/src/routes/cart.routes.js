const express = require("express");
const { addToCart, getCart } = require("../controllers/cart.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Añade tu clave secreta de Stripe

const router = express.Router();

// Todas las rutas de carrito requieren autenticación
router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/", getCart);

router.put('/update-item', async (req, res) => {
  const { id, quantity } = req.body;

  if (!id || quantity === undefined) {
    return res.status(400).json({ message: 'ID del item y cantidad son requeridos' });
  }

  try {
    // Lógica para actualizar el producto en el carrito
    const cartItem = await CartItemRepository.findOne({ where: { id } });
    if (!cartItem) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    cartItem.quantity = quantity;
    await CartItemRepository.save(cartItem);

    res.status(200).json({ message: 'Cantidad actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Nueva ruta para crear un PaymentIntent
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { totalAmount } = req.body;

    // Crear un PaymentIntent con el monto total
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convertir a centavos
      currency: "eur", // Cambia la moneda si es necesario
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