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

    // Validar que se proporcionó un itemId
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "ID del item del carrito es requerido"
      });
    }

    // Validar que se proporcionó una cantidad (puede ser 0 para eliminar)
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "La cantidad es requerida"
      });
    }

    const orderItemRepository = AppDataSource.getRepository("OrderItem");
    const orderRepository = AppDataSource.getRepository("Order");

    // Buscar el item en el carrito
    const orderItem = await orderItemRepository
      .createQueryBuilder("orderItem")
      .leftJoinAndSelect("orderItem.order", "order")
      .leftJoinAndSelect("order.customer", "customer")
      .leftJoinAndSelect("orderItem.product", "product")
      .where("orderItem.id = :itemId", { itemId })
      .andWhere("customer.id = :userId", { userId })
      .andWhere("order.status = :status", { status: "cart" })
      .getOne();

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado en el carrito"
      });
    }

    // Si la cantidad es 0, eliminar el item del carrito
    if (quantity === 0) {
      await orderItemRepository.remove(orderItem);
    } else {
      // Verificar stock disponible
      if (orderItem.product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "No hay suficiente stock disponible"
        });
      }

      // Actualizar la cantidad y el precio
      orderItem.quantity = quantity;
      await orderItemRepository.save(orderItem);
    }

    // Recalcular el total del carrito
    const orderId = orderItem.order.id;
    const updatedOrderItems = await orderItemRepository
      .createQueryBuilder("orderItem")
      .leftJoinAndSelect("orderItem.product", "product")
      .where("orderItem.order_id = :orderId", { orderId })
      .getMany();

    // Calcular nuevo totalAmount
    let totalAmount = 0;
    for (const item of updatedOrderItems) {
      totalAmount += parseFloat(item.price) * item.quantity;
    }

    // Actualizar el totalAmount en la orden
    await orderRepository
      .createQueryBuilder()
      .update()
      .set({ totalAmount })
      .where("id = :id", { id: orderId })
      .execute();

    // Obtener el carrito actualizado completo
    const updatedCart = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.orderItems", "orderItems")
      .leftJoinAndSelect("orderItems.product", "product")
      .where("order.id = :id", { id: orderId })
      .getOne();

    return res.json({
      success: true,
      data: {
        cart: updatedCart
      },
      message: quantity === 0 ? "Item eliminado del carrito" : "Cantidad actualizada"
    });
  } catch (error) {
    console.error("Error al actualizar ítem del carrito:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar ítem del carrito"
    });
  }
};

// Asegúrate de exportar la función correctamente
module.exports = { addToCart, getCart, updateCartItem };