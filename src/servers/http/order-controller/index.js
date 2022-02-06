const status = require('http-status');
const {NotFoundError} = require('../errors');
const {ROLES} = require('../../../constants');

class OrderController {
  constructor({User, Food, Order}) {
    this.User = User;
    this.Food = Food;
    this.Order = Order;
  }

  async findOne(req, res) {
    const {
      params: {orderId},
    } = req;

    const order = await this.Order.findById(orderId).populate({
      path: 'items.food',
      model: this.Food,
    });

    if (!order) {
      throw new NotFoundError();
    }

    res.status(status.OK).json(order);
  }

  async find(req, res) {
    const {
      params: {userId},
      user: {role},
    } = req;
    const whereClause = role === ROLES.ADMIN ? {} : {userId};

    const orders = await this.Order.find(whereClause).populate({
      path: 'items.food',
      model: this.Food,
    });

    res.status(status.OK).json(orders);
  }

  async create(req, res) {
    const {
      params: {userId},
      body,
    } = req;
    const user = await this.User.findById(userId);
    if (!user) {
      throw new NotFoundError();
    }

    const foodIds = body.map((item) => item.foodId);
    const foods = await this.Food.find({
      _id: {$in: foodIds},
    });

    const items = [];
    let totalPrice = 0;
    for (const item of body) {
      items.push({food: item.foodId, quantity: item.quantity});
      const result = foods.find((food) => food._id.toString() === item.foodId);
      totalPrice += result.price * item.quantity;
    }

    const order = await this.Order.create({
      userId,
      items,
      totalPrice,
      tableNo: body.tableNo || null,
    });
    res.status(status.CREATED).json(order);
  }
}

module.exports = OrderController;
