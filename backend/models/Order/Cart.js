const cartItemSchema = new Schema(
  {
    productId: {
      type: Types,
      ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    nameSnapshot: {
      type: String,
      required: true,
    },
    imageSnapshot: {
      type: String,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const cartSchema = new Schema ({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required:true,
        unique: true,
        index: true,
    },
    items: {
        type: [cartItemSchema],
        default: [],
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true});

module.export = mongoose.model('Cart', cartSchema);