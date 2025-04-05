const { AppDataSource } = require("../config/database");

// Modificar la función addToCart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID de producto y cantidad (mayor que 0) son requeridos"
      });
    }

    // Verificar que los repositorios estén disponibles
    const productRepository = AppDataSource.getRepository("Product");
    const orderRepository = AppDataSource.getRepository("Order");
    const orderItemRepository = AppDataSource.getRepository("OrderItem");
    const customerRepository = AppDataSource.getRepository("Customer");

    // Verificar que el usuario existe
    const customer = await customerRepository.findOne({ where: { id: userId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Verificar que el producto existe
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "No hay suficiente stock disponible"
      });
    }

    // Buscar carrito activo del usuario (order con status "cart")
    let cart = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .leftJoinAndSelect("order.customer", "customer")
      .where("customer.id = :userId", { userId })
      .andWhere("order.status = :status", { status: "cart" })
      .getOne();

    // Si no hay carrito, crear uno
    if (!cart) {
      cart = orderRepository.create({
        customer: { id: userId },
        status: "cart",
        totalAmount: 0,
        orderItems: []
      });
      
      await orderRepository.save(cart);
      
      // Recargar el carrito para tener todas las relaciones correctamente
      cart = await orderRepository.findOne({
        where: { id: cart.id },
        relations: ["orderItems", "customer"]
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.orderItems.find(item => 
      item.product && item.product.id === productId
    );

    if (existingItem) {
      // Actualizar cantidad
      existingItem.quantity += quantity;
      await orderItemRepository.save(existingItem);
    } else {
      // Crear nuevo item
      const orderItem = orderItemRepository.create({
        order: { id: cart.id },
        product: { id: productId },
        quantity: quantity,
        price: product.price
      });
      
      await orderItemRepository.save(orderItem);
    }

    // Recalcular total del carrito
    const updatedCart = await orderRepository.findOne({
      where: { id: cart.id },
      relations: ["orderItems", "orderItems.product"]
    });

    // Verificar que hay items y son válidos
    if (updatedCart.orderItems && updatedCart.orderItems.length > 0) {
      const total = updatedCart.orderItems.reduce(
        (sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 0)),
        0
      );

      updatedCart.totalAmount = total;
      await orderRepository.save(updatedCart);
    }

    return res.status(200).json({
      success: true,
      message: "Producto añadido al carrito",
      data: { cart: updatedCart }
    });
  } catch (error) {
    console.error("Error al añadir al carrito:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message
    });
  }
};

// Corregir el método getCart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "ID de usuario no encontrado en el token"
      });
    }
    
    const orderRepository = AppDataSource.getRepository("Order");

    // Buscar usando QueryBuilder para mayor control
    const cart = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .leftJoinAndSelect("order.customer", "customer")
      .where("customer.id = :userId", { userId })
      .andWhere("order.status = :status", { status: "cart" })
      .getOne();

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { cart: { orderItems: [], totalAmount: 0 } }
      });
    }

    return res.status(200).json({
      success: true,
      data: { cart }
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor: " + error.message
    });
  }
};

// Actualizar cantidad de un producto en el carrito
const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "ID del item y cantidad son requeridos"
      });
    }

    const orderRepository = AppDataSource.getRepository("Order");
    const orderItemRepository = AppDataSource.getRepository("OrderItem");

    // Verificar que el item existe y pertenece al carrito del usuario
    const orderItem = await orderItemRepository.findOne({
      where: { id: itemId },
      relations: ["order", "order.customer", "product"]
    });

    if (!orderItem || orderItem.order.customer.id !== userId) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado en el carrito"
      });
    }

    if (quantity <= 0) {
      // Eliminar item
      await orderItemRepository.remove(orderItem);
    } else {
      // Verificar stock disponible
      if (orderItem.product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "No hay suficiente stock disponible"
        });
      }

      // Actualizar cantidad
      orderItem.quantity = quantity;
      await orderItemRepository.save(orderItem);
    }

    // Recalcular total del carrito
    const cart = await orderRepository.findOne({
      where: { id: orderItem.order.id },
      relations: ["orderItems", "orderItems.product"]
    });

    const total = cart.orderItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity),
      0
    );

    cart.totalAmount = total;
    await orderRepository.save(cart);

    return res.status(200).json({
      success: true,
      message: "Carrito actualizado",
      data: { cart }
    });
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

module.exports = { addToCart, getCart, updateCartItem };