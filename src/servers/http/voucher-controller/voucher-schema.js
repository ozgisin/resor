const Joi = require('joi');

const VoucherCreateSchema = Joi.object()
  .keys({
    discount: Joi.number().positive().min(5).max(100).required(),
  })
  .label('payload')
  .required();

const VoucherFindSchema = Joi.object()
  .keys({
    code: Joi.string().min(8).max(8).required(),
  })
  .label('parameters')
  .required();

module.exports = {
  VoucherCreateSchema,
  VoucherFindSchema,
};
