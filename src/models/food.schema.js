module.exports = ({Schema}) => {
  return new Schema(
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      about: {
        type: String,
      },
      ingredients: [
        {
          type: String,
        },
      ],
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
    },
    {
      timestamps: true,
    },
  );
};
