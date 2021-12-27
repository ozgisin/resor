module.exports = (mongoose) => {
  const userSchema = require('./user.schema')(mongoose);
  const categorySchema = require('./category.schema')(mongoose);
  const productSchema = require('./product.schema')(mongoose);
  const orderSchema = require('./order.schema')(mongoose);

  const User = mongoose.model('User', userSchema, 'users');
  const Category = mongoose.model('Category', categorySchema, 'categories');
  const Product = mongoose.model('Product', productSchema, 'products');
  const Order = mongoose.model('Order', orderSchema, 'orders');

  return {
    User,
    Category,
    Product,
    Order,
  };
};
