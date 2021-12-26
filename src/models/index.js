module.exports = (mongoose) => {
  const userSchema = require('./user.schema')(mongoose);
  const categorySchema = require('./category.schema')(mongoose);

  const User = mongoose.model('User', userSchema);
  const Category = mongoose.model('Category', categorySchema);

  return {
    User,
    Category,
  };
};
