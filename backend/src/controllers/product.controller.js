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

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const productRepository = AppDataSource.getRepository("Product");
    const product = await productRepository.findOne({
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
    console.error("Error al obtener producto:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor"
    });
  }
};

module.exports = { getAllProducts, getProductById };