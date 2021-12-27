const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const CategoryParamSchema = Joi.object()
  .keys({
    categoryId: Joi.objectId().required(),
  })
  .label('parameters')
  .required();

module.exports = {CategoryParamSchema};
