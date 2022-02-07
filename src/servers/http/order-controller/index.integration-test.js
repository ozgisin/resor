const supertest = require('supertest');
const status = require('http-status');
const jwt = require('jsonwebtoken');
const {Models, config, db} = require('../../..');
require('../../../test-setup')(db);
const app = require('..')(Models, config);
const {ROLES} = require('../../../constants');

describe('Integration OrderController', () => {
  let response;
  let foods;
  let user;
  let token;

  beforeEach(async () => {
    user = await Models.User.create({
      firstName: 'Kerim',
      lastName: 'Özgiray',
      email: 'krm@test.com',
      password: 'password',
      role: ROLES.USER,
    });
    token = jwt.sign(
      {
        role: user.role,
      },
      config.token.secret,
      {
        subject: user._id.toString(),
        expiresIn: config.token.expiration,
      },
    );
    const category = await Models.Category.create({title: 'Beverages'});
    foods = await Models.Food.insertMany([
      {title: 'Cola Zero', price: 10, categoryId: category._id},
      {title: 'Orange Juice', price: 5, categoryId: category._id},
    ]);
  });

  describe('findOne()', () => {
    describe('when request params are invalid', () => {
      const INVALID_PARAMS = ['1234', 'test'];

      describe.each(INVALID_PARAMS)('with value %j', (queryParam) => {
        beforeEach(async () => {
          response = await supertest(app)
            .get(`/api/orders/${queryParam}`)
            .set('x-access-token', token);
        });

        it('returns correct status with correct title', () => {
          expect(response).toMatchObject({
            headers: {
              'content-type': 'application/problem+json; charset=utf-8',
            },
            status: status.NOT_FOUND,
            body: {
              name: 'NotFoundError',
            },
          });
        });
      });
    });

    describe('when everything is successful', () => {
      let order;

      beforeEach(async () => {
        order = await Models.Order.create({
          userId: user._id,
          items: [
            {
              food: foods[0]._id,
              quantity: 1,
            },
          ],
          totalPrice: 10,
        });

        response = await supertest(app)
          .get(`/api/orders/${order._id}`)
          .set('x-access-token', token);
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.OK,
          body: {
            _id: order._id,
            items: [
              {
                food: foods[0]._id,
                quantity: 1,
              },
            ],
            totalPrice: 10,
          },
        });
      });
    });

    describe('when order is not found', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .get(`/api/orders/61c8a0dab8298ed09a72a7d3`)
          .set('x-access-token', token);
      });

      it('returns correct status with correct title', () => {
        expect(response).toMatchObject({
          headers: {
            'content-type': 'application/problem+json; charset=utf-8',
          },
          status: status.NOT_FOUND,
          body: {
            name: 'NotFoundError',
          },
        });
      });
    });
  });

  describe.only('find()', () => {
    describe('when request params are invalid', () => {
      const INVALID_PARAMS = ['1234', 'test'];

      describe.each(INVALID_PARAMS)('with value %j', (queryParam) => {
        beforeEach(async () => {
          response = await supertest(app)
            .get(`/api/users/${queryParam}/orders`)
            .set('x-access-token', token);
        });

        it('returns correct status with correct title', () => {
          expect(response).toMatchObject({
            headers: {
              'content-type': 'application/problem+json; charset=utf-8',
            },
            status: status.NOT_FOUND,
            body: {
              name: 'NotFoundError',
            },
          });
        });
      });
    });

    describe('when everything is successful', () => {
      let order;

      beforeEach(async () => {
        order = await Models.Order.create({
          userId: user._id,
          items: [
            {
              food: foods[0]._id,
              quantity: 1,
            },
          ],
          totalPrice: 10,
        });

        response = await supertest(app)
          .get(`/api/users/${user._id}/orders`)
          .set('x-access-token', token);
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.OK,
          body: [
            {
              _id: order._id,
              items: [
                {
                  food: foods[0]._id,
                  quantity: 1,
                },
              ],
              totalPrice: 10,
            },
          ],
        });
      });
    });
  });

  describe('create()', () => {
    describe('when everything is successful', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post(`/api/users/${user._id}/orders`)
          .set('Content-Type', 'application/json')
          .set('x-access-token', token)
          .send([{foodId: foods[0]._id, quantity: 2}]);
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.CREATED,
          body: {
            items: [
              {
                food: foods[0]._id,
                quantity: 2,
              },
            ],
            totalPrice: 20,
          },
        });
      });
    });

    describe('when request does not the x-access-token header', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post(`/api/users/${user._id}/orders`)
          .set('Content-Type', 'application/json')
          .send([{foodId: foods[0]._id, quantity: 2}]);
      });

      it('returns correct status with correct title', () => {
        expect(response).toMatchObject({
          headers: {
            'content-type': 'application/problem+json; charset=utf-8',
          },
          status: status.FORBIDDEN,
          body: {
            name: 'AuthorizationError',
          },
        });
      });
    });
  });
});
