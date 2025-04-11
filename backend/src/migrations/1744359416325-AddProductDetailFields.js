const { MigrationInterface, QueryRunner } = require("typeorm");

class AddProductDetailFields1744359416325 {
  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE products ADD COLUMN "detailedDescription" TEXT`);
    await queryRunner.query(`ALTER TABLE products ADD COLUMN "specifications" JSON`);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE products DROP COLUMN "specifications"`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN "detailedDescription"`);
  }
}

module.exports = { AddProductDetailFields1744359416325 };