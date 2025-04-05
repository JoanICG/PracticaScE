const { AppDataSource } = require("../config/database");

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const customerRepository = AppDataSource.getRepository("Customer");
    const customers = await customerRepository.find({
      select: ["id", "name", "email", "role", "createdAt", "updatedAt"]
    });

    return res.json({
      success: true,
      data: {
        customers
      }
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// Obtener todos los pedidos
const getAllOrders = async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository("Order");
    const orders = await orderRepository.find({
      where: { status: {invert: true, value: "cart"} }, // Todos excepto los carritos
      relations: ["customer", "orderItems", "orderItems.product"],
      order: {
        createdAt: "DESC"
      }
    });

    return res.json({
      success: true,
      data: {
        orders
      }
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

// Actualizar estado de un pedido
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    // Validar estado
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido"
      });
    }
    
    const orderRepository = AppDataSource.getRepository("Order");
    const order = await orderRepository.findOne({
      where: { id: orderId }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado"
      });
    }
    
    order.status = status;
    await orderRepository.save(order);
    
    return res.json({
      success: true,
      message: "Estado del pedido actualizado correctamente",
      data: { order }
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

module.exports = { getAllUsers, getAllOrders, updateOrderStatus };