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
    imageUrl: {
      type: String,
      nullable: true
    },
    stock: {
      type: Number,
      default: 0
    },
    detailedDescription: {
      type: "text",
      nullable: true
    },
    specifications: {
      type: "json",
      nullable: true
    },
    // Timestamp
    createdAt: {
      type: "timestamp",
      createDate: true,
      nullable: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      nullable: true
    }
  },
  relations: {
    spareParts: {
      type: "one-to-many",
      target: "SparePart",
      inverseSide: "product",
      cascade: true
    }
  }
});

module.exports = { ProductSchema };