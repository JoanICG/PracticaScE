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
    
    const product = await AppDataSource.getRepository("Product")
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.spareParts", "spareParts")
      .where("product.id = :id", { id })
      .getOne();
    
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

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;

    if (!name || !description || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos obligatorios deben ser completados.",
      });
    }

    const productRepository = AppDataSource.getRepository("Product");

    const newProduct = productRepository.create({
      name,
      description,
      price,
      stock,
      imageUrl,
    });

    await productRepository.save(newProduct);

    return res.status(201).json({
      success: true,
      message: "Producto añadido con éxito.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error al añadir producto:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor.",
    });
  }
};

module.exports = { getAllProducts, getProductById, addProduct };