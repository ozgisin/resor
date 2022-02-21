module.exports = (mongoose) => {
  const userSchema = require('./user.schema')(mongoose);
  const categorySchema = require('./category.schema')(mongoose);
  const foodSchema = require('./food.schema')(mongoose);
  const orderSchema = require('./order.schema')(mongoose);
  const voucherSchema = require('./voucher.schema')(mongoose);

  const User = mongoose.model('User', userSchema, 'users');
  const Category = mongoose.model('Category', categorySchema, 'categories');
  const Food = mongoose.model('Food', foodSchema, 'foods');
  const Order = mongoose.model('Order', orderSchema, 'orders');
  const Voucher = mongoose.model('Voucher', voucherSchema, 'vouchers');

  return {
    User,
    Category,
    Food,
    Order,
    Voucher,
  };
};
