module.exports = ({Schema}) => {
  return new Schema(
    {
      title: {
        type: String,
        required: true,
        unique: true,
      },
      products: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      archivedAt: {
        type: Date,
        index: true,
      },
    },
    {
      timestamps: true,
    },
  );
};
