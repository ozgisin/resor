const status = require('http-status');
const {NotFoundError} = require('../errors');

class FoodController {
  constructor({Food, Category}) {
    this.Food = Food;
    this.Category = Category;
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

  async create(req, res) {
    const {
      params: {categoryId},
      body,
    } = req;

    const category = await this.Category.findById(categoryId);
    if (!category) {
      throw new NotFoundError();
    }
    const foods = await category.addFoods(body);
    res.status(status.CREATED).json(foods);
  }

  async delete(req, res) {
    const {
      params: {categoryId, foodId},
    } = req;

    const category = await this.Category.findById(categoryId);
    if (!category) {
      throw new NotFoundError();
    }
    await category.removeFood(foodId);
    res.status(status.NO_CONTENT).json();
  }
}

module.exports = FoodController;
