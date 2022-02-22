const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const {ROLES} = require('../../constants');

const {
  requestHandler,
  errorHandler,
  requestValidator,
  authorize,
} = require('./middleware');
const AuthController = require('./auth');
const CategoryController = require('./category-controller');
const FoodController = require('./food-controller');
const OrderController = require('./order-controller');
const VoucherController = require('./voucher-controller');
const {
  CategoryParamSchema,
  CategoryCreateSchema,
} = require('./category-controller/category-schema');
const {RegisterSchema, LoginSchema} = require('./auth/auth-schema');
const {
  FoodParamSchema,
  FoodFindParamSchema,
  FoodCreateSchema,
} = require('./food-controller/food-schema');
const {
  OrderParamSchema,
  OrderFindParamSchema,
  OrderCreateSchema,
  OrderUpdateSchema,
} = require('./order-controller/order-schema');
const {
  VoucherCreateSchema,
  VoucherFindSchema,
} = require('./voucher-controller/voucher-schema');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
  app.post(
    '/api/categories',
    authorize(ROLES.ADMIN),
    requestValidator(CategoryCreateSchema, 'body'),
    requestHandler(categoryController, 'create'),
  );

  app.delete(
    '/api/categories/:categoryId',
    authorize(ROLES.ADMIN),
    requestValidator(CategoryParamSchema, 'params'),
    requestHandler(categoryController, 'delete'),
  );

  const foodController = new FoodController(Models);
  app.get(
    '/api/categories/:categoryId/foods/:foodId',
    requestValidator(FoodParamSchema, 'params'),
    requestHandler(foodController, 'findOne'),
  );
  app.post(
    '/api/categories/:categoryId/foods',
    authorize(ROLES.ADMIN),
    requestValidator(FoodFindParamSchema, 'params'),
    requestValidator(FoodCreateSchema, 'body'),
    requestHandler(foodController, 'create'),
  );
  app.delete(
    '/api/categories/:categoryId/foods/:foodId',
    authorize(ROLES.ADMIN),
    requestValidator(FoodParamSchema, 'params'),
    requestHandler(foodController, 'delete'),
  );

  const orderController = new OrderController(Models);
  app.get(
    '/api/orders/:orderId',
    authorize([ROLES.ADMIN, ROLES.USER]),
    requestValidator(OrderFindParamSchema, 'params'),
    requestHandler(orderController, 'findOne'),
  );
  app.delete(
    '/api/orders/:orderId',
    authorize(ROLES.ADMIN),
    requestValidator(OrderFindParamSchema, 'params'),
    requestHandler(orderController, 'delete'),
  );
  app.get(
    '/api/users/:userId/orders',
    authorize([ROLES.ADMIN, ROLES.USER]),
    requestValidator(OrderParamSchema, 'params'),
    requestHandler(orderController, 'find'),
  );
  app.post(
    '/api/users/:userId/orders',
    authorize([ROLES.ADMIN, ROLES.USER]),
    requestValidator(OrderParamSchema, 'params'),
    requestValidator(OrderCreateSchema, 'body'),
    requestHandler(orderController, 'create'),
  );
  app.patch(
    '/api/orders/:orderId',
    authorize([ROLES.ADMIN]),
    requestValidator(OrderFindParamSchema, 'params'),
    requestValidator(OrderUpdateSchema, 'body'),
    requestHandler(orderController, 'update'),
  );

  const voucherController = new VoucherController(Models);
  app.get(
    '/api/vouchers',
    authorize(ROLES.ADMIN),
    requestHandler(voucherController, 'findAll'),
  );
  app.get(
    '/api/vouchers/:code',
    authorize([ROLES.ADMIN, ROLES.USER]),
    requestValidator(VoucherFindSchema, 'params'),
    requestHandler(voucherController, 'findOne'),
  );
  app.post(
    '/api/vouchers',
    authorize(ROLES.ADMIN),
    requestValidator(VoucherCreateSchema, 'body'),
    requestHandler(voucherController, 'create'),
  );

  app.use(errorHandler);

  return app;
};
