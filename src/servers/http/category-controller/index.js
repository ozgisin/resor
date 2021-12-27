class CategoryController {
  constructor({Category, Product}) {
    this.Category = Category;
    this.Product = Product;
  }

  async findOne(req, res) {
    const {
      params: {categoryId},
    } = req;

    const category = await this.Category.findById(categoryId).populate({
      path: 'products',
      model: this.Product,
      select: '_id title description',
    });

    res.status(200).json(category);
  }

  async findAll(req, res) {
    const categories = await this.Category.find({});
    res.status(200).json(categories);
  }
}

module.exports = CategoryController;
