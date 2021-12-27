const status = require('http-status');
const {NotFoundError} = require('../errors');

class FoodController {
  constructor({Food}) {
    this.Food = Food;
  }

  async findOne(req, res) {
    const {
      params: {foodId},
    } = req;

    const food = await this.Food.findById(foodId);

    if (!food) {
      throw new NotFoundError();
    }

    res.status(status.OK).json(food);
  }
}

module.exports = FoodController;
