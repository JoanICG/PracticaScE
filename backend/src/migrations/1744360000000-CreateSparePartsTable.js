const { MigrationInterface, QueryRunner } = require("typeorm");

class CreateSparePartsTable1744360000000 {
  async up(queryRunner) {
    // Crear tabla de spare_parts
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS spare_parts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        "imageUrl" VARCHAR,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        "product_id" UUID REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    
    // Crear índice para búsquedas más rápidas
    await queryRunner.query(`
      CREATE INDEX idx_spare_parts_product_id ON spare_parts("product_id")
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_spare_parts_product_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS spare_parts`);
  }
}

module.exports = { CreateSparePartsTable1744360000000 };