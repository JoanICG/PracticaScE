const { EntitySchema } = require("typeorm");

const CustomerSchema = new EntitySchema({
  name: "Customer",
  tableName: "customers",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid"
    },
    name: {
      type: String
    },
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String
    },
    role: {
      type: "enum",
      enum: ["customer", "admin"],
      default: "customer"
    },
    createdAt: {
      type: Date,
      createDate: true
    },
    updatedAt: {
      type: Date,
      updateDate: true
    }
  },
  relations: {
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "customer"
    }
  }
});

module.exports = { CustomerSchema };