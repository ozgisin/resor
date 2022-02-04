const supertest = require('supertest');
const status = require('http-status');
const jwt = require('jsonwebtoken');
const {Models, config, db} = require('../../..');
require('../../../test-setup')(db);
const app = require('..')(Models, config);
const {ROLES} = require('../../../constants');

describe('Integration FoodController', () => {
  let response;
  let category;

  beforeEach(async () => {
    category = await Models.Category.create({title: 'Beverages'});
  });

  describe('findOne()', () => {
    describe('when request params are invalid', () => {
      const INVALID_PARAMS = ['1234', 'test'];

      describe.each(INVALID_PARAMS)('with value %j', (queryParam) => {
        beforeEach(async () => {
          response = await supertest(app).get(
            `/api/categories/:categoryId/foods/${queryParam}`,
          );
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
      let food;
      beforeEach(async () => {
        food = await Models.Food.create({
          title: 'Orange Juice',
          price: 25,
          categoryId: category._id,
        });

        response = await supertest(app).get(
          `/api/categories/${category._id}/foods/${food._id}`,
        );
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.OK,
          body: {
            _id: food._id,
            title: food.title,
            price: 25,
          },
        });
      });
    });

    describe('when food is not found', () => {
      beforeEach(async () => {
        response = await supertest(app).get(
          `/api/categories/${category._id}/foods/61c8a0dab8298ed09a72a7d3`,
        );
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

  describe('create()', () => {
    describe('when everything is successful', () => {
      beforeEach(async () => {
        const user = await Models.User.create({
          firstName: 'Kerim',
          lastName: 'Özgiray',
          email: 'krm@test.com',
          password: 'password',
          role: ROLES.ADMIN,
        });
        const token = jwt.sign(
          {
            role: user.role,
          },
          config.token.secret,
          {
            subject: user._id.toString(),
            expiresIn: config.token.expiration,
          },
        );

        response = await supertest(app)
          .post(`/api/categories/${category._id}/foods`)
          .set('Content-Type', 'application/json')
          .set('x-access-token', token)
          .send([{title: 'Test Food', price: 10}]);
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.CREATED,
          body: [
            {
              title: 'Test Food',
              price: 10,
            },
          ],
        });
      });
    });

    describe('when user is not an admin', () => {
      beforeEach(async () => {
        const user = await Models.User.create({
          firstName: 'Kerim',
          lastName: 'Özgiray',
          email: 'krm@test.com',
          password: 'password',
          role: ROLES.USER,
        });
        const token = jwt.sign(
          {
            role: user.role,
          },
          config.token.secret,
          {
            subject: user._id.toString(),
            expiresIn: config.token.expiration,
          },
        );

        response = await supertest(app)
          .post(`/api/categories/${category._id}/foods`)
          .set('Content-Type', 'application/json')
          .set('x-access-token', token)
          .send([{title: 'Test Food', price: 10}]);
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

    describe('when request does not the x-access-token header', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post(`/api/categories/${category._id}/foods`)
          .set('Content-Type', 'application/json')
          .send([{title: 'Test Food', price: 10}]);
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

  describe('delete()', () => {
    let food;

    beforeEach(async () => {
      food = await Models.Food.create({
        title: 'Orange Juice',
        price: 25,
        categoryId: category._id,
      });
    });

    describe('when everything is successful', () => {
      beforeEach(async () => {
        const user = await Models.User.create({
          firstName: 'Kerim',
          lastName: 'Özgiray',
          email: 'krm@test.com',
          password: 'password',
          role: ROLES.ADMIN,
        });
        const token = jwt.sign(
          {
            role: user.role,
          },
          config.token.secret,
          {
            subject: user._id.toString(),
            expiresIn: config.token.expiration,
          },
        );

        response = await supertest(app)
          .delete(`/api/categories/${category._id}/foods/${food._id}`)
          .set('x-access-token', token);
      });

      it('returns correct status', () => {
        expect(response).toMatchObject({
          status: status.NO_CONTENT,
        });
      });
    });

    describe('when user is not an admin', () => {
      beforeEach(async () => {
        const user = await Models.User.create({
          firstName: 'Kerim',
          lastName: 'Özgiray',
          email: 'krm@test.com',
          password: 'password',
          role: ROLES.USER,
        });
        const token = jwt.sign(
          {
            role: user.role,
          },
          config.token.secret,
          {
            subject: user._id.toString(),
            expiresIn: config.token.expiration,
          },
        );

        response = await supertest(app)
          .delete(`/api/categories/${category._id}/foods/${food._id}`)
          .set('x-access-token', token);
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

    describe('when request does not the x-access-token header', () => {
      beforeEach(async () => {
        response = await supertest(app).delete(
          `/api/categories/${category._id}/foods/${food._id}`,
        );
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
