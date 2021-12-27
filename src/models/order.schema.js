module.exports = ({Schema}) => {
  return new Schema(
    {
      status: {
        type: String,
        required: true,
        default: 'pending',
        index: true,
        enum: ['pending', 'fulfilled', 'canceled'],
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      items: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      totalPrice: {
          type: Number,
      },
    },
    {
      timestamps: true,
    },
  );
};
