const status = require('http-status');
const {NotFoundError} = require('../errors');

class CategoryController {
  constructor({Category, Food}) {
    this.Category = Category;
    this.Food = Food;
  }

  async findOne(req, res) {
    const {
      params: {categoryId},
    } = req;

    const category = await this.Category.findById(categoryId).populate({
      path: 'foods',
      model: this.Food,
    });

    if (!category) {
      throw new NotFoundError();
    }

    res.status(status.OK).json(category);
  }

  async findAll(req, res) {
    const categories = await this.Category.find({});
    res.status(status.OK).json(categories);
  }

  async create(req, res) {
    const categories = await this.Category.insertMany(req.body);
    res.status(status.CREATED).json(categories);
  }

  async delete(req, res) {
    const {
      params: {categoryId},
    } = req;

    await this.Category.deleteOne({_id: categoryId});
    res.status(status.NO_CONTENT).json();
  }
}

module.exports = CategoryController;
