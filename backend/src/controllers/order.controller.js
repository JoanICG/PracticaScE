const { AppDataSource } = require("../config/database");

// Crear un pedido a partir del carrito
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "La dirección de envío es requerida"
      });
    }

    const orderRepository = AppDataSource.getRepository("Order");
    const productRepository = AppDataSource.getRepository("Product");

    // Obtener carrito del usuario
    const cart = await orderRepository.findOne({
      where: { 
        customer: { id: userId },
        status: "cart" 
      },
      relations: ["orderItems", "orderItems.product"]
    });

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
    cart.shippingAddress = shippingAddress;
    await orderRepository.save(cart);

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