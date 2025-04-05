const { AppDataSource } = require("../config/database");
require("dotenv").config();

const checkDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Verificar las tablas
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("Tablas en la base de datos:");
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
    // Intentar verificar el enum de status
    try {
      const orderStatusEnum = await AppDataSource.query(`
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'order_status'
      `);
      
      if (orderStatusEnum.length > 0) {
        console.log("\nValores del enum order_status:");
        orderStatusEnum.forEach(val => console.log(`- ${val.enumlabel}`));
      } else {
        console.log("\nNo se encontró el enum order_status");
      }
    } catch (err) {
      console.log("\nNo se pudo verificar el enum order_status:", err.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error al verificar la base de datos:", error);
    process.exit(1);
  }
};

checkDatabase();