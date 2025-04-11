const { AppDataSource } = require("../config/database");

// Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const productRepository = AppDataSource.getRepository("Product");
    const products = await productRepository.find({
      order: {
        createdAt: "DESC"
      }
    });

    return res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

/**
 * Obtiene los detalles de un producto específico
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await AppDataSource.getRepository("Product").findOne({
      where: { id }
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }
    
    return res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error("Error al obtener detalles del producto:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener detalles del producto"
    });
  }
};

module.exports = { getAllProducts, getProductById };