const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class CreateInitialSchema1683000000000 {
  async up(queryRunner) {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    // Create customers table
    await queryRunner.query(`
      CREATE TABLE customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await queryRunner.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL,
        "imageUrl" VARCHAR,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order status enum
    await queryRunner.query(`
      CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cart')
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        status order_status DEFAULT 'pending',
        "totalAmount" DECIMAL(10, 2) NOT NULL,
        customer_id UUID REFERENCES customers(id),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id)
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE order_items`);
    await queryRunner.query(`DROP TABLE orders`);
    await queryRunner.query(`DROP TYPE order_status`);
    await queryRunner.query(`DROP TABLE products`);
    await queryRunner.query(`DROP TABLE customers`);
  }
}