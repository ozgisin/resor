const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const {ROLES} = require('../../constants');

const {
  requestHandler,
  errorHandler,
  requestValidator,
  // authorize,
} = require('./middleware');
const CategoryController = require('./category-controller');
const AuthController = require('./auth');
const {CategoryParamSchema} = require('./category-controller/category-schema');
const {RegisterSchema, LoginSchema} = require('./auth/auth-schema');

const createApp = () => {
  const app = express();
  app.use(express.json());
  return app;
};

module.exports = (Models, config) => {
  const app = createApp();
  app.get('/', (request, res) => {
    res.send('Hello Resor');
  });

  const authController = new AuthController(Models, {config, bcrypt, jwt});
  app.post(
    '/register',
    requestValidator(RegisterSchema, 'body'),
    requestHandler(authController, 'register'),
  );
  app.post(
    '/login',
    requestValidator(LoginSchema, 'body'),
    requestHandler(authController, 'login'),
  );

  const categoryController = new CategoryController(Models);
  app.get('/api/categories', requestHandler(categoryController, 'findAll'));

  app.get(
    '/api/categories/:categoryId',
    requestValidator(CategoryParamSchema, 'params'),
    requestHandler(categoryController, 'findOne'),
  );

  app.use(errorHandler);

  return app;
};
