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
    return 'mongodb+srv://dbAdmin:5obhVbZHTdqVEVdQ@cluster0.wzsqq.mongodb.net/resor?retryWrites=true&w=majority';
  }

  return 'mongodb://localhost:27017/resor';
}

const config = {
  httPort: 3000,
  mongo: {
    uri: dbConnectionString(process.env.NODE_ENV),
  },
  token: {
    secret: 'resor-app',
    expiration: '2h',
  },
};

module.exports = config;
