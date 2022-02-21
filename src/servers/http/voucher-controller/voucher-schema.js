const Joi = require('joi');

const VoucherCreateSchema = Joi.object()
  .keys({
    discount: Joi.number().positive().min(5).max(100).required(),
  })
  .label('payload')
  .required();

module.exports = {
  VoucherCreateSchema,
};
