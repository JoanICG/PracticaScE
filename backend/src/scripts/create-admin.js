const { AppDataSource } = require("../config/database");
const { hashPassword } = require("../utils/password.util");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    const customerRepository = AppDataSource.getRepository("Customer");
    
    // Verificar si ya existe un administrador
    const existingAdmin = await customerRepository.findOne({ where: { role: "admin" } });
    
    if (existingAdmin) {
      console.log("Ya existe un administrador en el sistema");
      process.exit(0);
    }

    // Datos del administrador (puedes cambiarlos o pasarlos como argumentos)
    const adminData = {
      name: "Admin Principal",
      email: "admin@example.com",
      password: await hashPassword("adminpassword"),
      role: "admin"
    };

    // Crear administrador
    const admin = customerRepository.create(adminData);
    await customerRepository.save(admin);

    console.log("Administrador creado con éxito:");
    console.log(`Email: ${adminData.email}`);
    console.log(`Contraseña: adminpassword`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error al crear administrador:", error);
    process.exit(1);
  }
};

createAdmin();