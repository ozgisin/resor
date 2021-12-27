const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const FoodFindParamSchema = Joi.object()
  .keys({
    categoryId: Joi.objectId().required(),
  })
  .label('parameters')
  .required();

const FoodParamSchema = Joi.object()
  .keys({
    foodId: Joi.objectId().required(),
    categoryId: Joi.objectId().required(),
  })
  .label('parameters')
  .required();

const FoodCreateSchema = Joi.array()
  .items(
    Joi.object()
      .keys({
        title: Joi.string().max(50).required(),
        imageUrl: Joi.string().uri().optional(),
        description: Joi.string().max(255).optional(),
        about: Joi.string().max(255).optional(),
        ingredients: Joi.array().items(Joi.string().max(150)).optional(),
        price: Joi.number().positive().precision(2).required(),
        calories: Joi.number().positive().optional(),
        waitTime: Joi.number().positive().optional(),
      })
      .required(),
  )
  .label('payload')
  .required();

module.exports = {
  FoodParamSchema,
  FoodFindParamSchema,
  FoodCreateSchema,
};
