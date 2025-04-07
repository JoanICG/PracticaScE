const { AppDataSource } = require("../config/database");
require("dotenv").config();

const carsData = [
  {
    name: "Monster Truck 4x4",
    description: "Coche teledirigido Monster Truck 4x4 todoterreno con suspensión independiente y batería recargable. Perfecto para terrenos difíciles.",
    price: 69.99,
    stock: 15,
    imageUrl: "https://m.media-amazon.com/images/I/71kHz88kGsL._AC_SL1500_.jpg"
  },
  {
    name: "Ferrari GT Racing",
    description: "Réplica a escala 1:14 de Ferrari GT con detalles realistas. Control preciso con un alcance de hasta 30 metros.",
    price: 39.99,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1624555130581-1d9cca783bc0?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Buggy Desierto Extreme",
    description: "Buggy de alta velocidad para terrenos arenosos. Ruedas especiales antideslizantes y chasis resistente a impactos.",
    price: 59.99,
    stock: 12,
    imageUrl: "https://m.media-amazon.com/images/I/71p0GFRTbpL._AC_SL1500_.jpg"
  },
  {
    name: "Coche Acrobático 360°",
    description: "Realiza increíbles acrobacias y giros de 360 grados. Con luces LED y efectos de sonido para mayor diversión.",
    price: 29.99,
    stock: 25,
    imageUrl: "https://m.media-amazon.com/images/I/71J70LMQqDL._AC_SL1500_.jpg"
  },
  {
    name: "Lamborghini Aventador RC",
    description: "Réplica detallada de Lamborghini Aventador a escala 1:18. Incluye luces LED y puertas que se abren por control remoto.",
    price: 89.99,
    stock: 8,
    imageUrl: "https://m.media-amazon.com/images/I/71PfZfXkDyL._AC_SL1500_.jpg"
  },
  {
    name: "Crawler Rock Master",
    description: "Diseñado para escalar rocas y terrenos extremos. Con tracción 4x4 y neumáticos de goma de alto agarre.",
    price: 79.99,
    stock: 10,
    imageUrl: "https://m.media-amazon.com/images/I/81RB9qzX1zL._AC_SL1500_.jpg"
  },
  {
    name: "Drift Car Pro",
    description: "Especializado en derrapes controlados. Neumáticos de baja fricción y motor potente para drifting espectacular.",
    price: 54.99,
    stock: 15,
    imageUrl: "https://m.media-amazon.com/images/I/71QkE7Z56uL._AC_SL1500_.jpg"
  },
  {
    name: "Mini Racer Indoor",
    description: "Coche compacto ideal para interiores. Perfecto para niños pequeños con control sencillo y baja velocidad.",
    price: 24.99,
    stock: 30,
    imageUrl: "https://m.media-amazon.com/images/I/71cGQPQAhnL._AC_SL1500_.jpg"
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