const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddRoleToCustomers1683100000000 {
  async up(queryRunner) {
    // Verificar si el tipo customer_role ya existe
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'customer_role'
      )
    `);
    
    // Si no existe, crear el tipo enum
    if (!enumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE customer_role AS ENUM ('customer', 'admin')
      `);
    }
    
    // Verificar si la columna role ya existe
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'role'
      )
    `);
    
    // Si no existe, añadir la columna
    if (!columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE customers 
        ADD COLUMN role customer_role NOT NULL DEFAULT 'customer'
      `);
    }
  }

  async down(queryRunner) {
    // Eliminar columna si existe
    await queryRunner.query(`
      ALTER TABLE customers 
      DROP COLUMN IF EXISTS role
    `);
    
    // No eliminamos el tipo enum en down() para evitar errores con otras tablas
    // que puedan estar usándolo
  }
}