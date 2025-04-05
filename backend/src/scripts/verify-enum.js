const { AppDataSource } = require("../config/database");
require("dotenv").config();

const verifyEnum = async () => {
  try {
    await AppDataSource.initialize();
    
    // Consultar los valores válidos del enum
    const result = await AppDataSource.query(`
      SELECT enum_range(NULL::order_status) as values;
    `);
    
    console.log("Valores válidos del enum order_status:", result[0].values);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

verifyEnum();