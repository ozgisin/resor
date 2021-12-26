const Joi = require('joi');

const RegisterSchema = Joi.object()
  .keys({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().max(255),
  })
  .label('payload')
  .required();

const LoginSchema = Joi.object()
  .keys({
    email: Joi.string().email().required(),
    password: Joi.string().max(255),
  })
  .label('payload')
  .required();

module.exports = {
  RegisterSchema,
  LoginSchema,
};
