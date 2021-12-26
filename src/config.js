const config = {
  httPort: 3000,
  mongo: {
    uri: 'mongodb://localhost:27017/resor',
  },
  token: {
    secret: 'resor-app',
    expiration: '2h',
  },
};

module.exports = config;
