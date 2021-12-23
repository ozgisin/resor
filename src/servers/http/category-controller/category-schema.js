const Joi = require('joi');

const CategorySchema = Joi.object()
  .keys({
    title: Joi.string().max(255).required(),
  })
  .label('payload')
  .required();

module.exports = {CategorySchema};
