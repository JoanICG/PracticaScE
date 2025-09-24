const { AppDataSource } = require("../config/database");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Crear un pedido a partir del carrito
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentIntentId, checkoutSessionId } = req.body;
    const userId = req.user.id;
    console.log('[orders/create] inicio', { userId, hasPI: !!paymentIntentId, hasSession: !!checkoutSessionId, hasAddress: !!shippingAddress });

    // Verificar el pago ya sea por PaymentIntent directo o por Session de Checkout
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: "El pago no ha sido completado correctamente"
        });
      }
    } else if (checkoutSessionId) {
      const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({
          success: false,
          message: "El pago no ha sido completado correctamente"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Falta el identificador de pago (paymentIntentId o checkoutSessionId)"
      });
    }

    const orderRepository = AppDataSource.getRepository("Order");
    const productRepository = AppDataSource.getRepository("Product");

    // Obtener el carrito del usuario
    const cart = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .leftJoinAndSelect("order.customer", "customer")
      .where("customer.id = :userId", { userId })
      .andWhere("order.status = :status", { status: "cart" })
      .getOne();

    if (!cart || cart.orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay productos en el carrito"
      });
    }

    // Verificar stock disponible para todos los productos
    for (const item of cart.orderItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `No hay suficiente stock disponible para ${item.product.name}`
        });
      }
    }

    // Actualizar stock de productos
    for (const item of cart.orderItems) {
      const product = item.product;
      product.stock -= item.quantity;
      await productRepository.save(product);
    }

    // Convertir carrito a pedido
    cart.status = "pending";
    cart.shippingAddress = shippingAddress || cart.shippingAddress || null;
    await orderRepository.save(cart);
    console.log('[orders/create] pedido creado', { orderId: cart.id, userId });
    return res.status(200).json({
      success: true,
      message: "Pedido creado correctamente",
      data: { order: cart }
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// Actualizar la función getUserOrders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "ID de usuario no encontrado en el token"
      });
    }
    
    const orderRepository = AppDataSource.getRepository("Order");

    // Usar QueryBuilder para una consulta más precisa
    const orders = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .leftJoinAndSelect("order.customer", "customer")
      .where("customer.id = :userId", { userId })
      .andWhere("order.status != :status", { status: "cart" })
      .orderBy("order.createdAt", "DESC")
      .getMany();

    return res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message
    });
  }
};

module.exports = { createOrder, getUserOrders };