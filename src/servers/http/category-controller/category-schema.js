const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const CategoryParamSchema = Joi.object()
  .keys({
    categoryId: Joi.objectId().required(),
  })
  .label('parameters')
  .required();

const CategoryCreateSchema = Joi.array()
  .items(
    Joi.object()
      .keys({
        title: Joi.string().max(50).required(),
        imageUrl: Joi.string().uri().optional(),
        description: Joi.string().max(255).optional(),
      })
      .required(),
  )
  .label('payload')
  .required();

module.exports = {
  CategoryParamSchema,
  CategoryCreateSchema,
};
