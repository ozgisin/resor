const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {ORDER_STATUS} = require('../../../constants');

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

const OrderUpdateSchema = Joi.object()
  .keys({
    status: Joi.string()
      .valid(...Object.values(ORDER_STATUS))
      .required(),
  })
  .label('payload')
  .required();

const OrderCreateSchema = Joi.object()
  .keys({
    tableNo: Joi.number().positive().min(1).max(100).optional(),
    voucher: Joi.string().min(8).max(8).optional(),
    note: Joi.string().optional(),
    items: Joi.array().items(
      Joi.object()
        .keys({
          foodId: Joi.objectId().required(),
          quantity: Joi.number().positive().min(1).max(20).required(),
        })
        .required(),
    ),
  })
  .label('payload')
  .required();

module.exports = {
  OrderParamSchema,
  OrderFindParamSchema,
  OrderCreateSchema,
  OrderUpdateSchema,
};
