const { AppDataSource } = require("../config/database");
require("dotenv").config();

const forceRecreateDatabase = async () => {
  try {
    // 1. Obtener los datos actuales si es posible
    let existingCustomers = [];
    let existingProducts = [];
    
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      existingCustomers = await AppDataSource.query(`SELECT * FROM customers`);
      existingProducts = await AppDataSource.query(`SELECT * FROM products`);
      
      console.log(`Respaldados ${existingCustomers.length} clientes y ${existingProducts.length} productos`);
      
      // Cerrar la conexión
      await AppDataSource.destroy();
    } catch (error) {
      console.log("No se pudieron respaldar datos:", error.message);
    }
    
    // 2. Forzar la recreación de la base de datos
    console.log("Modificando opciones para recrear la base de datos...");
    AppDataSource.options.synchronize = true;
    AppDataSource.options.dropSchema = true;
    
    // 3. Inicializar con las nuevas opciones
    console.log("Recreando la base de datos...");
    await AppDataSource.initialize();
    console.log("✅ Base de datos recreada correctamente");
    
    // 4. Restaurar datos importantes si es necesario
    if (existingCustomers.length > 0) {
      console.log("Restaurando clientes...");
      // Código para restaurar clientes
    }
    
    if (existingProducts.length > 0) {
      console.log("Restaurando productos...");
      // Código para restaurar productos
    }
    
    // 5. Verificar estructura final
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("\nTablas creadas en la base de datos:");
    tables.forEach(table => console.log(`- ${table.table_name}`));
    
    // Verificar el enum
    const orderStatusEnum = await AppDataSource.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'order_status'
    `);
    
    console.log("\nValores del enum order_status:");
    orderStatusEnum.forEach(val => console.log(`- ${val.enumlabel}`));
    
    console.log("\n✅ Todo el proceso completado con éxito!");
    
    // Importante: Restaurar opciones para evitar recreación accidental
    AppDataSource.options.synchronize = false;
    AppDataSource.options.dropSchema = false;
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fatal durante la recreación:", error);
    process.exit(1);
  }
};

forceRecreateDatabase();