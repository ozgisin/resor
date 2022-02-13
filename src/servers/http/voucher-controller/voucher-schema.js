const Joi = require('joi');

const VoucherParamSchema = Joi.object()
  .keys({
    isUsed: Joi.boolean().optional(),
  })
  .label('parameters')
  .required();

const VoucherCreateSchema = Joi.object()
  .keys({
    discount: Joi.number().positive().min(5).max(100).required(),
    count: Joi.number().positive().min(1).max(100).required(),
  })
  .label('payload')
  .required();

module.exports = {
  VoucherParamSchema,
  VoucherCreateSchema,
};
