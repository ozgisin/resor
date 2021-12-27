const supertest = require('supertest');
const status = require('http-status');
const jwt = require('jsonwebtoken');
const {Models, config, db} = require('../../..');
require('../../../test-setup')(db);
const app = require('..')(Models, config);
const {ROLES} = require('../../../constants');

describe('Integration CategoryController', () => {
  let response;

  describe('findOne()', () => {
    describe('when request params are invalid', () => {
      const INVALID_PARAMS = ['1234', 'test'];

      describe.each(INVALID_PARAMS)('with value %j', (queryParam) => {
        beforeEach(async () => {
          response = await supertest(app).get(`/api/categories/${queryParam}`);
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
      let categories;
      beforeEach(async () => {
        categories = await Models.Category.insertMany([
          {title: 'Starters'},
          {title: 'Beverages'},
        ]);

        response = await supertest(app).get(
          `/api/categories/${categories[0]._id}`,
        );
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.OK,
          body: {
            _id: categories[0]._id,
            title: categories[0].title,
          },
        });
      });
    });

    describe('when category is not found', () => {
      beforeEach(async () => {
        response = await supertest(app).get(
          `/api/categories/61c8a0dab8298ed09a72a7d3`,
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

  describe('findAll()', () => {
    describe('when everything is successful', () => {
      let categories;
      beforeEach(async () => {
        categories = await Models.Category.insertMany([
          {title: 'Starters'},
          {title: 'Beverages'},
        ]);

        response = await supertest(app).get('/api/categories');
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.OK,
          body: [
            {
              _id: categories[0]._id,
              title: categories[0].title,
            },
            {
              _id: categories[1]._id,
              title: categories[1].title,
            },
          ],
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
          .post('/api/categories')
          .set('Content-Type', 'application/json')
          .set('x-access-token', token)
          .send([{title: 'Test Category'}]);
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: status.CREATED,
          body: [
            {
              title: 'Test Category',
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
          .post('/api/categories')
          .set('Content-Type', 'application/json')
          .set('x-access-token', token)
          .send([{title: 'Test Category'}]);
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
          .post('/api/categories')
          .set('Content-Type', 'application/json')
          .send([{title: 'Test Category'}]);
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
    let categories;

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

        categories = await Models.Category.insertMany([
          {title: 'Soups'},
          {title: 'Pizzas'},
        ]);

        response = await supertest(app)
          .delete(`/api/categories/${categories[0]._id}`)
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

        categories = await Models.Category.insertMany([
          {title: 'Starters'},
          {title: 'Beverages'},
        ]);

        response = await supertest(app)
          .delete(`/api/categories/${categories[0]._id}`)
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
        categories = await Models.Category.insertMany([
          {title: 'Starters'},
          {title: 'Beverages'},
        ]);
        response = await supertest(app).delete(
          `/api/categories/${categories[0]._id}`,
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
