const process = require('process');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function dbConnectionString(env) {
  if (env === 'development') {
    return 'mongodb://localhost:27017/resor';
  }
  if (env === 'test') {
    return 'mongodb://localhost:27017/integration_tests';
  }

  if (env === 'production') {
    return `mongodb+srv://dbAdmin:${process.env.DB_PASSWORD}@cluster0.wzsqq.mongodb.net/resor?retryWrites=true&w=majority`;
  }

  return 'mongodb://localhost:27017/resor';
}

const config = {
  httPort: process.env.PORT || 3000,
  mongo: {
    uri: dbConnectionString(process.env.NODE_ENV),
  },
  token: {
    secret: process.env.JWT_SECRET || 'resor-app',
    expiration: '2h',
  },
};

module.exports = config;
