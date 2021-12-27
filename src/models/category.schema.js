const {NotFoundError} = require('../servers/http/errors');

module.exports = (mongoose) => {
  const {Schema} = mongoose;
  const categorySchema = new Schema(
    {
      title: {
        type: String,
        required: true,
        unique: true,
      },
      imageUrl: {
        type: String,
      },
      description: {
        type: String,
      },
      foods: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Food',
        },
      ],
    },
    {
      timestamps: true,
    },
  );

  categorySchema.methods.addFoods = async function (foods = []) {
    for (const food of foods) {
      food.categoryId = this._id;
    }

    const createdFoods = await mongoose.model('Food').insertMany(foods);

    const foodIds = createdFoods.map((food) => food._id);

    this.foods.push(...foodIds);

    await this.save();

    return createdFoods;
  };

  categorySchema.methods.removeFood = async function (foodId) {
    const {deletedCount} = await mongoose
      .model('Food')
      .deleteOne({_id: foodId});

    if (deletedCount === 0) {
      throw new NotFoundError();
    }

    const index = this.foods.indexOf(foodId);
    if (index > -1) {
      this.foods.splice(index, 1);
    }

    await this.save();
  };

  return categorySchema;
};
