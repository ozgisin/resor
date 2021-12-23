module.exports = (mongoose) => {
  const categorySchema = require('./category.schema')(mongoose);
  const Category = mongoose.model('Category', categorySchema);

  return {
    Category,
  };
};
