const express = require('express');
const {
  requestHandler,
  errorHandler,
  requestValidator,
} = require('./middleware');
const CategoryController = require('./category-controller');
const {CategorySchema} = require('./category-controller/category-schema');

const createApp = () => {
  const app = express();
  app.use(express.json());
  return app;
};

module.exports = (Models) => {
  const app = createApp();
  app.get('/', (request, res) => {
    res.send('Hello Resor');
  });

  const categoryController = new CategoryController(Models);
  app.post(
    '/api/categories',
    requestValidator(CategorySchema, 'body'),
    requestHandler(categoryController, 'create'),
  );

  app.use(errorHandler);

  return app;
};
