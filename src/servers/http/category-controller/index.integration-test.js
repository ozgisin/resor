const supertest = require('supertest');
const {Models, config, db} = require('../../..');
require('../../../test-setup')(db);
const app = require('..')(Models, config);

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
            status: 404,
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
          status: 200,
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
          status: 404,
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
          status: 200,
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
});
