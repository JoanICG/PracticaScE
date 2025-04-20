const { AppDataSource } = require("../config/database");
require("dotenv").config();

// Datos de ejemplo para repuestos de coches RC
const getSparePartsForProduct = (productName) => {
  const commonParts = [
    {
      name: "Batería de repuesto",
      description: "Batería de alta capacidad compatible",
      price: 15.99,
      stock: 20,
      imageUrl: "https://m.media-amazon.com/images/I/61+R+BcbOvL._AC_SL1500_.jpg"
    },
    {
      name: "Motor principal",
      description: "Motor de repuesto para reemplazar el motor original",
      price: 12.50,
      stock: 10,
      imageUrl: "https://m.media-amazon.com/images/I/71GMhoGfYBL._AC_SL1500_.jpg"
    },
    {
      name: "Set de neumáticos (4 unidades)",
      description: "Neumáticos de repuesto idénticos a los originales",
      price: 9.99,
      stock: 15,
      imageUrl: "https://m.media-amazon.com/images/I/71blYjKVRgL._AC_SL1500_.jpg"
    }
  ];

  // Partes específicas según el tipo de vehículo
  if (productName.toLowerCase().includes("monster") || productName.toLowerCase().includes("truck")) {
    return [
      ...commonParts,
      {
        name: "Amortiguadores reforzados",
        description: "Amortiguadores de alta resistencia para terrenos difíciles",
        price: 11.99,
        stock: 8,
        imageUrl: "https://m.media-amazon.com/images/I/61FnnhH+mUL._AC_SL1500_.jpg"
      },
      {
        name: "Chasis reforzado",
        description: "Chasis de repuesto resistente a impactos",
        price: 22.50,
        stock: 5,
        imageUrl: "https://m.media-amazon.com/images/I/61fzpg+G5nL._AC_SL1000_.jpg"
      }
    ];
  } else if (productName.toLowerCase().includes("ferrari") || productName.toLowerCase().includes("lamborghini")) {
    return [
      ...commonParts,
      {
        name: "Carrocería de repuesto",
        description: "Carrocería completa, réplica exacta del original",
        price: 19.99,
        stock: 6,
        imageUrl: "https://m.media-amazon.com/images/I/61Mjj2YHQcL._AC_SL1200_.jpg"
      },
      {
        name: "Luces LED de repuesto",
        description: "Kit completo de luces LED para reemplazar las originales",
        price: 8.95,
        stock: 12,
        imageUrl: "https://m.media-amazon.com/images/I/71LT9QeQPML._AC_SL1500_.jpg"
      }
    ];
  } else if (productName.toLowerCase().includes("crawler") || productName.toLowerCase().includes("rock")) {
    return [
      ...commonParts,
      {
        name: "Kit de transmisión 4x4",
        description: "Sistema completo de transmisión para terrenos extremos",
        price: 24.99,
        stock: 8,
        imageUrl: "https://m.media-amazon.com/images/I/61XyBHQeJpL._AC_SL1200_.jpg"
      },
      {
        name: "Neumáticos todoterreno de alta tracción",
        description: "Neumáticos especiales para escalada en rocas",
        price: 15.99,
        stock: 14,
        imageUrl: "https://m.media-amazon.com/images/I/81ccF+7YlnL._AC_SL1500_.jpg"
      }
    ];
  } else if (productName.toLowerCase().includes("drift") || productName.toLowerCase().includes("racing")) {
    return [
      ...commonParts,
      {
        name: "Neumáticos de deriva",
        description: "Neumáticos de baja fricción especiales para drift",
        price: 12.99,
        stock: 16,
        imageUrl: "https://m.media-amazon.com/images/I/71Q+HB2FWOL._AC_SL1500_.jpg"
      },
      {
        name: "Kit de suspensión deportiva",
        description: "Suspensión ajustable para mejor rendimiento en curvas",
        price: 17.50,
        stock: 10,
        imageUrl: "https://m.media-amazon.com/images/I/71I4ESxPFiL._AC_SL1500_.jpg"
      }
    ];
  } else {
    // Para cualquier otro tipo de vehículo
    return [
      ...commonParts,
      {
        name: "Mando a distancia de repuesto",
        description: "Mando compatible con todas las funciones",
        price: 19.99,
        stock: 7,
        imageUrl: "https://m.media-amazon.com/images/I/71uQ7k9yYwL._AC_SL1500_.jpg"
      }
    ];
  }
};

const createSpareParts = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    const productRepository = AppDataSource.getRepository("Product");
    const sparePartRepository = AppDataSource.getRepository("SparePart");
    
    // Obtener todos los productos
    const products = await productRepository.find();
    console.log(`Se encontraron ${products.length} productos para añadir repuestos`);
    
    // Eliminar repuestos existentes
    await sparePartRepository.clear();
    console.log("Repuestos anteriores eliminados");
    
    let totalPartsAdded = 0;
    
    // Añadir repuestos para cada producto
    for (const product of products) {
      console.log(`Procesando producto: ${product.name}`);
      
      const spareParts = getSparePartsForProduct(product.name);
      
      for (const partData of spareParts) {
        const part = sparePartRepository.create({
          ...partData,
          product: { id: product.id }
        });
        
        await sparePartRepository.save(part);
        totalPartsAdded++;
      }
      
      console.log(`  - Añadidos ${spareParts.length} repuestos`);
    }
    
    console.log(`✅ Total: ${totalPartsAdded} repuestos añadidos para ${products.length} productos`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createSpareParts();