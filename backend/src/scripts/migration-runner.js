const { AppDataSource } = require("../config/database");
require("dotenv").config();

/**
 * Script para ejecutar migraciones pendientes
 */
const runMigrations = async () => {
  try {
    // Inicializar la conexión a la base de datos
    await AppDataSource.initialize();
    console.log("✅ Conexión a la base de datos establecida");

    // Ejecutar migraciones pendientes
    console.log("🔄 Ejecutando migraciones...");
    await AppDataSource.runMigrations();
    console.log("✅ Migraciones ejecutadas con éxito");

    // Cerrar la conexión
    await AppDataSource.destroy();
    console.log("👋 Conexión a la base de datos cerrada");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar migraciones:", error);
    
    // Intentar cerrar la conexión si hay un error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    process.exit(1);
  }
};

// Ejecutar la función principal
runMigrations();