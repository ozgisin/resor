const {ORDER_STATUS} = require('../constants');

module.exports = ({Schema}) => {
  return new Schema(
    {
      status: {
        type: String,
        required: true,
        default: ORDER_STATUS.PENDING,
        index: true,
        enum: [
          ORDER_STATUS.PENDING,
          ORDER_STATUS.FULFILLED,
          ORDER_STATUS.CANCELED,
        ],
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
