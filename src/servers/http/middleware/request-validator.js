const {ValidationError, NotFoundError} = require('../errors');

const validator = (schema, property) => (request, _, next) => {
  const {value: validatedValue, error} = schema.validate(request[property]);
  if (!error) {
    request[property] = validatedValue;
    next();
  } else {
    if (property === 'params') {
      next(new NotFoundError());
      return;
    }

    const {details} = error;
    const errors = details.map((detail) => detail.message);
    next(new ValidationError('Bad request', errors));
  }
};

module.exports = validator;
