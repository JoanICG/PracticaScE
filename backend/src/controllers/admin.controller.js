const { AppDataSource } = require("../config/database");

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const customerRepository = AppDataSource.getRepository("Customer");
    const users = await customerRepository.find();
    
    return res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message
    });
  }
};

// Obtener todos los pedidos (excluyendo carritos)
const getAllOrders = async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository("Order");
    
    // Modificar la consulta para incluir shippingAddress en la selección
    const orders = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .leftJoinAndSelect("order.customer", "customer")
      .where("order.status != :status", { status: "cart" })
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
      message: "Error del servidor"
    });
  }
};

// Obtener un pedido específico por ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido requerido"
      });
    }
    
    const orderRepository = AppDataSource.getRepository("Order");
    
    const order = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.customer", "customer")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .where("order.id = :id", { id })
      .getOne();
      
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message
    });
  }
};

// Actualizar el estado de un pedido
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido y estado son requeridos"
      });
    }
    
    // Validar que el status sea válido
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado no válido. Estados permitidos: pending, processing, shipped, delivered, cancelled"
      });
    }
    
    const orderRepository = AppDataSource.getRepository("Order");
    
    // Buscar el pedido para asegurarnos que existe
    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ["customer", "orderItems", "orderItems.product"]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado"
      });
    }
    
    // Actualizar el estado
    order.status = status;
    await orderRepository.save(order);
    
    return res.status(200).json({
      success: true,
      message: "Estado del pedido actualizado correctamente",
      data: { order }
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message
    });
  }
};

module.exports = { getAllUsers, getAllOrders, getOrderById, updateOrderStatus };