const {ROLES} = require('../constants');

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
      role: {
        type: String,
        required: true,
        default: ROLES.USER,
        enum: [ROLES.ADMIN, ROLES.USER],
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
