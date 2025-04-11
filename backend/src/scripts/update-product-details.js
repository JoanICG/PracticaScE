const { AppDataSource } = require("../config/database");
require("dotenv").config();

const carSpecifications = [
  {
    scale: ["1:10", "1:12", "1:16", "1:18", "1:24"],
    motorType: ["Eléctrico", "Nitro", "Brushless", "Brushed"],
    batteryType: ["Li-Po", "Ni-MH", "Ni-Cd"],
    batteryCapacity: ["1200mAh", "1500mAh", "2000mAh", "3000mAh", "4000mAh"],
    maxSpeed: ["15 km/h", "20 km/h", "30 km/h", "45 km/h", "60 km/h"],
    controlRange: ["30m", "50m", "100m", "150m", "200m"],
    driveTrain: ["2WD", "4WD", "AWD"],
    suspension: ["Independiente", "Rígida", "Semi-rígida"],
    material: ["Plástico ABS", "Metal", "Fibra de carbono", "Aluminio"]
  }
];

const generateRandomSpecs = () => {
  const specs = {};
  
  // Seleccionar valores aleatorios para cada especificación
  Object.keys(carSpecifications[0]).forEach(key => {
    const values = carSpecifications[0][key];
    specs[key] = values[Math.floor(Math.random() * values.length)];
  });
  
  return specs;
};

const generateDetailedDescription = (name, specs) => {
  return `El ${name} es un coche teledirigido de escala ${specs.scale} con motor ${specs.motorType}. 
Equipado con una batería ${specs.batteryType} de ${specs.batteryCapacity} que proporciona una autonomía excepcional.
Alcanza velocidades de hasta ${specs.maxSpeed} y tiene un alcance de control de ${specs.controlRange}.
Su sistema de transmisión ${specs.driveTrain} junto con la suspensión ${specs.suspension.toLowerCase()} 
le proporcionan un rendimiento óptimo en diferentes superficies.
Fabricado principalmente en ${specs.material}, es resistente y duradero.
Perfecto para principiantes y expertos que buscan disfrutar de la velocidad y maniobrabilidad.`;
};

const updateProductDetails = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    const productRepository = AppDataSource.getRepository("Product");
    
    // Obtener todos los productos
    const products = await productRepository.find();
    console.log(`Se encontraron ${products.length} productos para actualizar`);
    
    // Actualizar cada producto
    for (const product of products) {
      const specs = generateRandomSpecs();
      const detailedDescription = generateDetailedDescription(product.name, specs);
      
      // Actualizar en la base de datos
      product.detailedDescription = detailedDescription;
      product.specifications = specs;
      
      await productRepository.save(product);
      console.log(`Producto ID ${product.id} actualizado con éxito`);
    }
    
    console.log("Todos los productos han sido actualizados con información detallada");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

updateProductDetails();