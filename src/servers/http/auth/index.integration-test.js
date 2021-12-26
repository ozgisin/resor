const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const {Models, config, db} = require('../../..');
require('../../../test-setup')(db);
const app = require('..')(Models, config);

describe('Integration AuthenticationController', () => {
  let response;

  describe('register()', () => {
    describe('when request params are invalid', () => {
      const INVALID_PARAMS = [
        {firstName: 'test', lastName: 'test', password: 'pass', email: 'test'},
        {param: 'test'},
      ];

      describe.each(INVALID_PARAMS)('with value %j', (requestParam) => {
        beforeEach(async () => {
          response = await supertest(app)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send(requestParam);
        });

        it('returns correct status with correct title', () => {
          expect(response).toMatchObject({
            headers: {
              'content-type': 'application/problem+json; charset=utf-8',
            },
            status: 400,
            body: {
              message: 'Bad request',
              name: 'ValidationError',
              errors: expect.any(Array),
            },
          });
        });
      });
    });

    describe('when registration is successful', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send({
            firstName: 'Kerim',
            lastName: 'Özgiray',
            email: 'krm@test.com',
            password: 'password',
          });
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: 201,
          body: {
            firstName: 'Kerim',
            lastName: 'Özgiray',
            email: 'krm@test.com',
            token: expect.any(String),
          },
        });
      });
    });

    describe('when user with same email already exists', () => {
      beforeEach(async () => {
        await Models.User.create({
          firstName: 'Kerim',
          lastName: 'Özgiray',
          email: 'krm@test.com',
          password: 'password',
        });

        response = await supertest(app)
          .post('/register')
          .set('Content-Type', 'application/json')
          .send({
            firstName: 'Kerim',
            lastName: 'Özgiray',
            email: 'krm@test.com',
            password: 'password',
          });
      });

      it('returns correct status with correct title', () => {
        expect(response).toMatchObject({
          headers: {
            'content-type': 'application/problem+json; charset=utf-8',
          },
          status: 401,
          body: {
            message: 'User already exists. Please Login',
            name: 'AuthenticationError',
          },
        });
      });
    });
  });

  describe('login()', () => {
    describe('when request params are invalid', () => {
      const INVALID_PARAMS = [
        {password: 'pass', email: 'test'},
        {param: 'test'},
      ];

      describe.each(INVALID_PARAMS)('with value %j', (requestParam) => {
        beforeEach(async () => {
          response = await supertest(app)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send(requestParam);
        });

        it('returns correct status with correct title', () => {
          expect(response).toMatchObject({
            headers: {
              'content-type': 'application/problem+json; charset=utf-8',
            },
            status: 400,
            body: {
              message: 'Bad request',
              name: 'ValidationError',
              errors: expect.any(Array),
            },
          });
        });
      });
    });

    describe('when user does not exist', () => {
      beforeEach(async () => {
        response = await supertest(app)
          .post('/login')
          .set('Content-Type', 'application/json')
          .send({
            email: 'krm@test.com',
            password: 'password',
          });
      });

      it('returns correct status with correct title', () => {
        expect(response).toMatchObject({
          headers: {
            'content-type': 'application/problem+json; charset=utf-8',
          },
          status: 401,
          body: {
            message: 'Invalid credentials',
            name: 'AuthenticationError',
          },
        });
      });
    });

    describe('when login is successful', () => {
      beforeEach(async () => {
        const salt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash('password', salt);

        await Models.User.create({
          firstName: 'Kerim',
          lastName: 'Özgiray',
          email: 'krm@test.com',
          password: encryptedPassword,
        });

        response = await supertest(app)
          .post('/login')
          .set('Content-Type', 'application/json')
          .send({
            email: 'krm@test.com',
            password: 'password',
          });
      });

      it('returns correct status and body', () => {
        expect(response).toMatchObject({
          status: 200,
          body: {
            firstName: 'Kerim',
            lastName: 'Özgiray',
            email: 'krm@test.com',
            token: expect.any(String),
          },
        });
      });
    });
  });
});
