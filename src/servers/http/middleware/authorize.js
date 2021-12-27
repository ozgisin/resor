const jwt = require('jsonwebtoken');
const {AuthorizationError} = require('../errors');
const {
  token: {secret},
} = require('../../../config');

module.exports = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles]; // eslint-disable-line no-param-reassign
  }

  return [
    (req, res, next) => {
      const token =
        req.body.token || req.query.token || req.headers['x-access-token'];

      if (!token) {
        throw new AuthorizationError('Unauthorized');
      }

      try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
      } catch (error) {
        throw new AuthorizationError('Unauthorized');
      }

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        // user's role is not authorized
        throw new AuthorizationError('Unauthorized');
      }

      return next();
    },
  ];
};
