module.exports = ({Schema}) => {
  return new Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      calories: {
        type: Number,
      },
      waitTime: {
        type: Number,
      },
      imageUrl: {
        type: String,
      },
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true,
      },
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
