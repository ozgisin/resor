module.exports = ({Schema}) => {
  return new Schema(
    {
      title: {
        type: String,
        required: true,
        unique: true,
      },
      imageUrl: {
        type: String,
      },
      description: {
        type: String,
      },
      foods: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Food',
        },
      ],
    },
    {
      timestamps: true,
    },
  );
};
