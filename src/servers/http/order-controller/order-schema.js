const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const OrderParamSchema = Joi.object()
  .keys({
    userId: Joi.objectId().required(),
  })
  .label('parameters')
  .required();

const OrderFindParamSchema = Joi.object()
  .keys({
    orderId: Joi.objectId().required(),
  })
  .label('parameters')
  .required();

const OrderCreateSchema = Joi.array()
  .items(
    Joi.object()
      .keys({
        foodId: Joi.objectId().required(),
        quantity: Joi.number().positive().min(1).max(20).required(),
        tableNo: Joi.number().positive().min(1).max(100).optional(),
      })
      .required(),
  )
  .label('payload')
  .required();

module.exports = {
  OrderParamSchema,
  OrderFindParamSchema,
  OrderCreateSchema,
};
