module.exports = ({Schema}) => {
  return new Schema(
    {
      isUsed: {
        type: Boolean,
        required: true,
        default: false,
        index: true,
      },
      code: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 8,
        uppercase: true,
        trim: true,
        unique: true,
        index: true,
      },
      discount: {
        type: Number,
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );
};
