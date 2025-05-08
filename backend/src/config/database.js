const { DataSource } = require("typeorm");
require("dotenv").config();

const CustomerSchema = require("../schemas/customer.schema").CustomerSchema;
const ProductSchema = require("../schemas/product.schema").ProductSchema;
const OrderSchema = require("../schemas/order.schema").OrderSchema;
const OrderItemSchema = require("../schemas/order-item.schema").OrderItemSchema;
const SparePartSchema = require("../schemas/spare-part.schema").SparePartSchema;

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "ecommerce",
  synchronize: true, // DELETE THIS IN PRODUCTION
  logging: process.env.DB_LOGGING === "true",
  entities: [CustomerSchema, ProductSchema, OrderSchema, OrderItemSchema, SparePartSchema],
  migrations: ["src/migrations/**/*.js"],
  subscribers: ["src/subscribers/**/*.js"], // optional, if you have subscribers 
});



module.exports = { AppDataSource };