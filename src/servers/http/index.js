const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  requestHandler,
  errorHandler,
  requestValidator,
  // auth,
} = require('./middleware');
const CategoryController = require('./category-controller');
const AuthController = require('./auth');
const {CategorySchema} = require('./category-controller/category-schema');
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
    requestValidator(CategorySchema, 'params'),
    requestHandler(categoryController, 'findOne'),
  );

  app.use(errorHandler);

  return app;
};
