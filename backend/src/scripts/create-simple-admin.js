const { AppDataSource } = require("../config/database");
const { hashPassword } = require("../utils/password.util");
require("dotenv").config();

const createSimpleAdmin = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    const customerRepository = AppDataSource.getRepository("Customer");
    
    // Datos del administrador SIMPLIFICADOS
    const adminData = {
      name: "Admin Simple",
      email: "admin123@example.com",
      password: "admin123", // Contraseña muy simple
    };

    // Hashear contraseña
    const hashedPassword = await hashPassword(adminData.password);
    console.log("Contraseña original:", adminData.password);
    console.log("Contraseña hasheada:", hashedPassword);

    // Verificar si ya existe
    const existingAdmin = await customerRepository.findOne({ 
      where: { email: adminData.email } 
    });

    if (existingAdmin) {
      console.log("El administrador ya existe, actualizando contraseña...");
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin"; // Asegurarse que tenga rol admin
      await customerRepository.save(existingAdmin);
      console.log("Contraseña actualizada correctamente");
    } else {
      // Crear nuevo administrador
      const admin = customerRepository.create({
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: "admin"
      });

      await customerRepository.save(admin);
      console.log("Administrador creado con éxito");
    }

    console.log("Detalles de acceso:");
    console.log(`Email: ${adminData.email}`);
    console.log(`Contraseña: ${adminData.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createSimpleAdmin();