const {ExtendableError} = require('../errors');
const {
  CONTENT_TYPES: {PROBLEM_JSON},
} = require('./constants');

module.exports = (err, request, response, next) => {
  if (response.headersSent) {
    return next(err);
  }

  request.error = err;
  if (err instanceof ExtendableError) {
    return response.status(err.status).type(PROBLEM_JSON).json(err.toJSON());
  }

  return response.status(500).type(PROBLEM_JSON).json({
    title: 'Internal Server Error',
    status: 500,
  });
};
