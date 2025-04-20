const { EntitySchema } = require("typeorm");

const SparePartSchema = new EntitySchema({
  name: "SparePart",
  tableName: "spare_parts",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid"
    },
    name: {
      type: String,
      nullable: false
    },
    description: {
      type: String,
      nullable: true
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false
    },
    stock: {
      type: Number,
      default: 0
    },
    imageUrl: {
      type: String,
      nullable: true
    },
    // Timestamps
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
    product: {
      type: "many-to-one",
      target: "Product",
      inverseSide: "spareParts",
      joinColumn: {
        name: "product_id",
        referencedColumnName: "id"
      },
      onDelete: "CASCADE"
    }
  }
});

module.exports = { SparePartSchema };