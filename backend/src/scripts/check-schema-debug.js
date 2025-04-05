require("dotenv").config();
const { DataSource } = require("typeorm");

const checkSchema = async () => {
  console.log("Iniciando script de verificación de esquema...");
  
  // Crear una conexión directa sin usar AppDataSource
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || "ecommerce",
    logging: true
  });

  try {
    console.log("Intentando conectar a la base de datos...");
    await dataSource.initialize();
    console.log("Conexión a base de datos establecida correctamente.");

    try {
      // Ver la estructura de la tabla
      console.log("Consultando estructura de la tabla customers...");
      const tableSchema = await dataSource.query(`
        SELECT column_name, data_type, udt_name
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = 'customers';
      `);
      
      console.log("Estructura de la tabla customers:");
      console.table(tableSchema);
    } catch (queryError) {
      console.error("Error consultando estructura de tabla:", queryError);
    }
    
    try {
      // Ver tipos enumerados en la base de datos
      console.log("Consultando tipos ENUM...");
      const enumTypes = await dataSource.query(`
        SELECT n.nspname as schema, t.typname as type
        FROM pg_type t 
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typtype = 'e';
      `);
      
      console.log("Tipos ENUM en la base de datos:");
      console.table(enumTypes);
    } catch (enumError) {
      console.error("Error consultando tipos ENUM:", enumError);
    }

  } catch (connectionError) {
    console.error("Error de conexión a la base de datos:", connectionError);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log("Conexión cerrada.");
    }
  }
};

console.log("Script iniciado");
checkSchema()
  .then(() => {
    console.log("Script completado");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error general en el script:", error);
    process.exit(1);
  });