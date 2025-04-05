const { AppDataSource } = require("../config/database");
require("dotenv").config();

const fixOrderStatus = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    console.log("Conexión establecida. Iniciando corrección...");
    
    // 1. Primero guardamos los datos actuales (opcional, para no perderlos)
    const currentOrders = await AppDataSource.query(`SELECT * FROM orders`);
    console.log(`Respaldados ${currentOrders.length} pedidos`);
    
    // 2. Modificamos la tabla orders para usar VARCHAR temporalmente
    await AppDataSource.query(`
      ALTER TABLE orders 
      ALTER COLUMN status TYPE VARCHAR(20)
    `);
    console.log("Columna status cambiada a VARCHAR");
    
    // 3. Creamos el tipo ENUM
    await AppDataSource.query(`
      CREATE TYPE order_status AS ENUM (
        'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cart'
      )
    `);
    console.log("Tipo ENUM order_status creado correctamente");
    
    // 4. Convertimos la columna a usar el nuevo ENUM
    await AppDataSource.query(`
      ALTER TABLE orders 
      ALTER COLUMN status TYPE order_status USING status::order_status
    `);
    console.log("Columna status convertida a tipo ENUM order_status");
    
    // 5. Verificamos el resultado
    const orderStatusEnum = await AppDataSource.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'order_status'
    `);
    
    console.log("\n✅ Valores del enum order_status creados correctamente:");
    orderStatusEnum.forEach(val => console.log(`- ${val.enumlabel}`));
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al corregir la base de datos:", error);
    process.exit(1);
  }
};

fixOrderStatus();