const { AppDataSource } = require("../config/database");
require("dotenv").config();

const resetDatabase = async () => {
  try {
    // Inicializar la conexión
    let dataSource = AppDataSource;
    
    // Si ya está inicializada, la desconectamos primero
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    
    // Modificar configuración para forzar recreación
    dataSource.options.synchronize = true;
    dataSource.options.dropSchema = true;
    
    // Inicializar con opciones de recreación
    await dataSource.initialize();
    
    console.log("✅ Base de datos recreada exitosamente");
    
    // Agregar datos iniciales si es necesario
    // await seedInitialData();
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al recrear la base de datos:", error);
    process.exit(1);
  }
};

resetDatabase();