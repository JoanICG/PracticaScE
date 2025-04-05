const { AppDataSource } = require("../config/database");
require("dotenv").config();

const resetOrderTable = async () => {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    // Eliminar tablas en orden para evitar problemas de llaves foráneas
    await AppDataSource.query(`DROP TABLE IF EXISTS order_items CASCADE`);
    await AppDataSource.query(`DROP TABLE IF EXISTS orders CASCADE`);
    
    // Eliminar el tipo enum si existe
    await AppDataSource.query(`DROP TYPE IF EXISTS order_status CASCADE`);
    
    // Crear nuevo tipo enum con todos los valores
    await AppDataSource.query(`CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cart')`);
    
    // Sincronizar con TypeORM para recrear las tablas
    await AppDataSource.synchronize(true);
    
    console.log("Tabla de órdenes reiniciada correctamente");
    process.exit(0);
  } catch (error) {
    console.error("Error al reiniciar tablas:", error);
    process.exit(1);
  }
};

resetOrderTable();