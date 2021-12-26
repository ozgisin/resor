const supertest = require('supertest');
const {Models, config, db} = require('../../..');
require('../../../test-setup')(db);
const app = require('..')(Models, config);

describe('Integration AuthenticationController', () => {
  let response;

  describe('register()', () => {
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
  });
});
