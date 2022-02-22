const httpStatus = require('http-status');
const {NotFoundError} = require('../errors');
const {ROLES} = require('../../../constants');

class OrderController {
  constructor({User, Food, Order, Voucher}) {
    this.User = User;
    this.Food = Food;
    this.Order = Order;
    this.Voucher = Voucher;
  }

  async findOne(req, res) {
    const {
      params: {orderId},
    } = req;

    const order = await this.Order.findById(orderId)
      .populate({
        path: 'items.food',
        model: this.Food,
      })
      .populate({path: 'voucher', model: this.Voucher});

    if (!order) {
      throw new NotFoundError();
    }

    res.status(httpStatus.OK).json(order);
  }

  async find(req, res) {
    const {
      params: {userId},
      user: {role},
    } = req;
    const whereClause = role === ROLES.ADMIN ? {} : {userId};

    const orders = await this.Order.find(whereClause)
      .populate({
        path: 'items.food',
        model: this.Food,
      })
      .populate({path: 'voucher', model: this.Voucher});

    res.status(httpStatus.OK).json(orders);
  }

  async create(req, res) {
    const {
      params: {userId},
      body: {items, tableNo, note, voucher},
    } = req;
    const user = await this.User.findById(userId);
    if (!user) {
      throw new NotFoundError();
    }

    let voucherCode;

    const foodIds = items.map((item) => item.foodId);
    const foods = await this.Food.find({
      _id: {$in: foodIds},
    });

    const lineItems = [];
    let totalPrice = 0;
    for (const item of items) {
      lineItems.push({food: item.foodId, quantity: item.quantity});
      const result = foods.find((food) => food._id.toString() === item.foodId);
      totalPrice += result.price * item.quantity;
    }

    if (voucher) {
      voucherCode = await this.Voucher.findOne({
        code: voucher,
      });

      if (!voucherCode) {
        throw new NotFoundError('Invalid Voucher !');
      }

      totalPrice -= totalPrice * (voucherCode.discount / 100);
    }

    const order = await this.Order.create({
      userId,
      items: lineItems,
      totalPrice,
      tableNo: tableNo || null,
      note: note || null,
      voucher: voucher ? voucherCode._id : null,
    });

    res.status(httpStatus.CREATED).json(order);
  }

  async delete(req, res) {
    const {
      params: {orderId},
    } = req;

    await this.Order.deleteOne({_id: orderId});
    res.status(httpStatus.NO_CONTENT).json();
  }

  async update(req, res) {
    const {
      params: {orderId},
      body: {status},
    } = req;

    const order = await this.Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    console.log('status->', status);

    order.status = status;
    await order.save();

    res.status(httpStatus.OK).json(order);
  }
}

module.exports = OrderController;
