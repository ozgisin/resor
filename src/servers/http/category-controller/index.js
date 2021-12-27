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

    const category = await this.Category.findOne({
      _id: categoryId,
      archivedAt: null,
    }).populate({
      path: 'foods',
      model: this.Food,
      select: '_id title imageUrl price',
    });

    if (!category) {
      throw new NotFoundError();
    }

    res.status(200).json(category);
  }

  async findAll(req, res) {
    const categories = await this.Category.find({});
    res.status(200).json(categories);
  }
}

module.exports = CategoryController;
