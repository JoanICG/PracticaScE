const { EntitySchema } = require("typeorm");

const OrderItemSchema = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid"
    },
    quantity: {
      type: Number
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2
    }
  },
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: {
        name: "order_id"
      },
      onDelete: "CASCADE"
    },
    product: {
      type: "many-to-one", 
      target: "Product",
      joinColumn: {
        name: "product_id"
      }
    }
  }
});

module.exports = { OrderItemSchema };