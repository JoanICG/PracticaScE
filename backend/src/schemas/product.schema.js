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
    // Añadir campos de timestamp
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
  // ...relaciones y otras configuraciones existentes...
});

module.exports = { ProductSchema };