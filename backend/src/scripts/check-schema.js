const { AppDataSource } = require("../config/database");

const checkSchema = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Conexión a base de datos establecida");

    // Ver la estructura de la tabla
    const tableSchema = await AppDataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE table_name = 'customers';
    `);
    
    console.log("Estructura de la tabla customers:");
    console.table(tableSchema);
    
    // Ver tipos enumerados en la base de datos
    const enumTypes = await AppDataSource.query(`
      SELECT n.nspname as schema, t.typname as type
      FROM pg_type t 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typtype = 'e';
    `);
    
    console.log("\nTipos ENUM en la base de datos:");
    console.table(enumTypes);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkSchema();