class CategoryController {
  constructor({Category}) {
    this.Category = Category;
  }

  async create(req, res) {
    const {
      body: {title},
    } = req;

    const category = new this.Category({title, archivedAt: null});

    try {
      await category.save();
      res.send(category);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

module.exports = CategoryController;
