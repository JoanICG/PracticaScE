const { AppDataSource } = require("../config/database");
require("dotenv").config();

const carsData = [
  {
    name: "Monster Truck 4x4",
    description: "Coche teledirigido Monster Truck 4x4 todoterreno con suspensión independiente y batería recargable. Perfecto para terrenos difíciles.",
    price: 69.99,
    stock: 15,
    imageUrl: "https://es.hobbyteam.net/22642-large_default/coche-rc-crawler-ftx-outback-3-treka-110-brushed.jpg"
  },
  {
    name: "Ferrari GT Racing",
    description: "Réplica a escala 1:14 de Ferrari GT con detalles realistas. Control preciso con un alcance de hasta 30 metros.",
    price: 39.99,
    stock: 20,
    imageUrl: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTTr4nBU0vK7DDEg05s9b5zmUQ75VMtkyLz9BkPNHKanPDBCO7e1m8daXRvW52opr4gnqbnY1gJ5JOkX10MYp_E3km-uflTYTlmLRxkC8VorXimgf4fO81Zzg"
  },
  {
    name: "Buggy Desierto Extreme",
    description: "Buggy de alta velocidad para terrenos arenosos. Ruedas especiales antideslizantes y chasis resistente a impactos.",
    price: 59.99,
    stock: 12,
    imageUrl: "https://www.1001hobbies.es/2632826-large_default/mhdpro-z86100-micro-mhd-extreme-desert-buggy-orange-1-20-rtr-rc-electr.jpg"
  },
  {
    name: "Coche Acrobático 360°",
    description: "Realiza increíbles acrobacias y giros de 360 grados. Con luces LED y efectos de sonido para mayor diversión.",
    price: 29.99,
    stock: 25,
    imageUrl: "https://m.media-amazon.com/images/I/81JXB8bXR6L.jpg"
  },
  {
    name: "Lamborghini Aventador RC",
    description: "Réplica detallada de Lamborghini Aventador a escala 1:18. Incluye luces LED y puertas que se abren por control remoto.",
    price: 89.99,
    stock: 8,
    imageUrl: "https://m.media-amazon.com/images/I/71CCvuYUB6L.jpg"
  },
  {
    name: "Crawler Rock Master",
    description: "Diseñado para escalar rocas y terrenos extremos. Con tracción 4x4 y neumáticos de goma de alto agarre.",
    price: 79.99,
    stock: 10,
    imageUrl: "https://www.juguetesonline.com/23889-large_default/maisto-coche-teledirigido-4x4-rock-crawler.jpg"
  },
  {
    name: "Drift Car Pro",
    description: "Especializado en derrapes controlados. Neumáticos de baja fricción y motor potente para drifting espectacular.",
    price: 54.99,
    stock: 15,
    imageUrl: "https://m.media-amazon.com/images/I/71mhOx1olOL.jpg"
  },
  {
    name: "Mini Racer Indoor",
    description: "Coche compacto ideal para interiores. Perfecto para niños pequeños con control sencillo y baja velocidad.",
    price: 24.99,
    stock: 30,
    imageUrl: "https://m.media-amazon.com/images/I/713JSIJVMJL._AC_UF1000,1000_QL80_.jpg"
  }
];

const createProducts = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    const productRepository = AppDataSource.getRepository("Product");
    
    // Verificar si ya existen productos
    const existingCount = await productRepository.count();
    
    if (existingCount > 0) {
      console.log(`Ya existen ${existingCount} productos en la base de datos.`);
      const overwrite = process.argv.includes('--overwrite');
      
      if (!overwrite) {
        console.log("Si deseas sobrescribir, ejecuta el script con la opción --overwrite");
        process.exit(0);
      }
      
      console.log("Eliminando productos existentes...");
      await productRepository.clear();
    }

    // Crear productos
    for (const carData of carsData) {
      const product = productRepository.create(carData);
      await productRepository.save(product);
      console.log(`Producto creado: ${carData.name}`);
    }

    console.log(`Se han creado ${carsData.length} productos correctamente`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createProducts();