const { EntitySchema } = require("typeorm");

const OrderSchema = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid"
    },
    status: {
      type: "enum",
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "cart"],
      default: "pending"
    },
    totalAmount: {
      type: "decimal",
      precision: 10,
      scale: 2
    },
    shippingAddress: {
      type: "text",
      nullable: true
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
    customer: {
      type: "many-to-one",
      target: "Customer",
      joinColumn: {
        name: "customer_id"
      }
    },
    orderItems: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "order"
    }
  }
});

module.exports = { OrderSchema };