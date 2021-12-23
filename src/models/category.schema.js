module.exports = ({Schema}) => {
  return new Schema(
    {
      title: {
        type: String,
        required: true,
        unique: true,
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
