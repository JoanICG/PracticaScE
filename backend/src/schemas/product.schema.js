const { EntitySchema } = require("typeorm");

const ProductSchema = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid"
    },
    name: {
      type: String
    },
    description: {
      type: String
    },
    price: {
      type: "decimal", 
      precision: 10, 
      scale: 2
    },
    stock: {
      type: Number
    },
    imageUrl: {
      type: String,
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
    orderItems: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "product"
    }
  }
});

module.exports = { ProductSchema };