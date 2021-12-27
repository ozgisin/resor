const CategoryController = require('.');
const {NotFoundError} = require('../errors');

describe('CategoryController', () => {
  let Category;
  let Product;
  let mockResponse;
  let res;

  beforeEach(() => {
    Category = {
      find: jest.fn(),
      findById: jest.fn(() => {
        jest.fn();
      }),
    };
    Product = {};
    mockResponse = {json: jest.fn()};
    res = {status: jest.fn().mockReturnValue(mockResponse)};
  });

  describe('constructor', () => {
    let categoryController;

    beforeEach(() => {
      categoryController = new CategoryController({Category, Product});
    });

    it('initialized the class members', () => {
      expect(categoryController.Category).toBe(Category);
      expect(categoryController.Product).toBe(Product);
    });
  });

  describe('findOne', () => {
    let categoryController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let category;
      let product;
      let mockResult;

      beforeEach(async () => {
        req = {
          params: {
            categoryId: 'test-category-id',
          },
        };
        product = {
          _id: 'test-product-id',
          title: 'Test Product',
        };
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          products: [product],
        };
        mockResult = {populate: jest.fn().mockResolvedValue(category)};
        Category = {findById: jest.fn().mockReturnValue(mockResult)};

        categoryController = new CategoryController({Category, Product});

        await categoryController.findOne(req, res);
      });

      it('calls Category.findById with correct params', () => {
        expect(categoryController.Category.findById).toHaveBeenCalledWith(
          'test-category-id',
        );
      });

      it('calls Category.findById().populate with correct params', () => {
        expect(mockResult.populate).toHaveBeenCalledWith({
          path: 'products',
          model: Product,
        });
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(category);
      });
    });

    describe('when category does not exist in database', () => {
      let mockResult;
      let error;

      beforeEach(() => {
        error = new NotFoundError();
        req = {
          params: {
            categoryId: 'test-category-id',
          },
        };
        /** Important ! */
        mockResult = {populate: jest.fn().mockResolvedValue(null)};
        Category = {findById: jest.fn().mockReturnValue(mockResult)};

        categoryController = new CategoryController({Category, Product});
      });

      it('throws NotFoundError', async () => {
        await expect(categoryController.findOne(req, res)).rejects.toThrow(
          error,
        );
      });
    });

    describe('when Category.findById fails', () => {
      let mockResult;
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {
          params: {
            categoryId: 'test-category-id',
          },
        };
        /** Important ! */
        mockResult = {populate: jest.fn().mockRejectedValue(error)};
        Category = {findById: jest.fn().mockReturnValue(mockResult)};

        categoryController = new CategoryController({Category, Product});
      });

      it('rejects', async () => {
        await expect(categoryController.findOne(req, res)).rejects.toThrow(
          error,
        );
      });
    });
  });

  describe('findAll', () => {
    let categoryController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let category;

      beforeEach(async () => {
        req = {};
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          products: [],
        };
        Category = {find: jest.fn().mockResolvedValue([category])};
        categoryController = new CategoryController({Category, Product});

        await categoryController.findAll(req, res);
      });

      it('calls Category.find with correct params', () => {
        expect(categoryController.Category.find).toHaveBeenCalledWith({});
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith([category]);
      });
    });

    describe('when Category.find fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {};
        Category = {find: jest.fn().mockRejectedValue(error)};
        categoryController = new CategoryController({Category, Product});
      });

      it('rejects', async () => {
        await expect(
          categoryController.Category.find(req, res),
        ).rejects.toThrow(error);
      });
    });
  });
});
