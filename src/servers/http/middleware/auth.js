const jwt = require('jsonwebtoken');
const {AuthorizationError} = require('../errors');
const {
  token: {secret},
} = require('../../../config');

module.exports = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
    throw new AuthorizationError();
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch (error) {
    throw new AuthorizationError('Invalid Token');
  }

  return next();
};
