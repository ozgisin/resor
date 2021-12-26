module.exports = ({Schema}) => {
  const userSchema = new Schema(
    {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        unique: true,
      },
      password: {
        type: String,
      },
      token: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  );

  userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

  return userSchema;
};
