const status = require('http-status');
const CategoryController = require('.');
const {NotFoundError} = require('../errors');

describe('CategoryController', () => {
  let Category;
  let Food;
  let mockResponse;
  let res;

  beforeEach(() => {
    Category = {
      find: jest.fn(),
      findById: jest.fn(),
      insertMany: jest.fn(),
      deleteOne: jest.fn(),
    };
    Food = {};
    mockResponse = {json: jest.fn()};
    res = {status: jest.fn().mockReturnValue(mockResponse)};
  });

  describe('constructor', () => {
    let categoryController;

    beforeEach(() => {
      categoryController = new CategoryController({Category, Food});
    });

    it('initialized the class members', () => {
      expect(categoryController.Category).toBe(Category);
      expect(categoryController.Food).toBe(Food);
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
      let food;
      let mockResult;

      beforeEach(async () => {
        req = {
          params: {
            categoryId: 'test-category-id',
          },
        };
        food = {
          _id: 'test-food-id',
          title: 'Test Food',
        };
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          foods: [food],
        };
        mockResult = {populate: jest.fn().mockResolvedValue(category)};
        Category = {findById: jest.fn().mockReturnValue(mockResult)};

        categoryController = new CategoryController({Category, Food});

        await categoryController.findOne(req, res);
      });

      it('calls Category.findById with correct params', () => {
        expect(categoryController.Category.findById).toHaveBeenCalledWith(
          'test-category-id',
        );
      });

      it('calls Category.findOne().populate with correct params', () => {
        expect(mockResult.populate).toHaveBeenCalledWith({
          path: 'foods',
          model: Food,
          select: '_id title imageUrl price',
        });
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.OK);
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

        categoryController = new CategoryController({Category, Food});
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

        categoryController = new CategoryController({Category, Food});
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
          foods: [],
        };
        Category = {find: jest.fn().mockResolvedValue([category])};
        categoryController = new CategoryController({Category, Food});

        await categoryController.findAll(req, res);
      });

      it('calls Category.find with correct params', () => {
        expect(categoryController.Category.find).toHaveBeenCalledWith({});
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.OK);
        expect(mockResponse.json).toHaveBeenCalledWith([category]);
      });
    });

    describe('when Category.find fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {};
        Category = {find: jest.fn().mockRejectedValue(error)};
        categoryController = new CategoryController({Category, Food});
      });

      it('rejects', async () => {
        await expect(categoryController.findAll(req, res)).rejects.toThrow(
          error,
        );
      });
    });
  });

  describe('create', () => {
    let categoryController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let category;

      beforeEach(async () => {
        category = {
          title: 'Test Category',
        };
        req = {body: [category]};
        Category = {insertMany: jest.fn().mockResolvedValue([category])};
        categoryController = new CategoryController({Category, Food});

        await categoryController.create(req, res);
      });

      it('calls Category.insertMany with correct params', () => {
        expect(categoryController.Category.insertMany).toHaveBeenCalledWith(
          req.body,
        );
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.CREATED);
        expect(mockResponse.json).toHaveBeenCalledWith([category]);
      });
    });

    describe('when Category.insertMany fails', () => {
      let error;
      let category;

      beforeEach(() => {
        error = new Error('Test Error');
        category = {
          title: 'Test Category',
        };
        req = {body: [category]};
        Category = {insertMany: jest.fn().mockRejectedValue(error)};
        categoryController = new CategoryController({Category, Food});
      });

      it('rejects', async () => {
        await expect(categoryController.create(req, res)).rejects.toThrow(
          error,
        );
      });
    });
  });

  describe('delete', () => {
    let categoryController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      beforeEach(async () => {
        req = {params: {categoryId: 'test-category-id'}};
        categoryController = new CategoryController({Category, Food});

        await categoryController.delete(req, res);
      });

      it('calls Category.deleteOne with correct params', () => {
        expect(categoryController.Category.deleteOne).toHaveBeenCalledWith({
          _id: req.params.categoryId,
        });
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.NO_CONTENT);
      });
    });

    describe('when Category.deleteOne fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {params: {categoryId: 'test-category-id'}};
        Category = {deleteOne: jest.fn().mockRejectedValue(error)};
        categoryController = new CategoryController({Category, Food});
      });

      it('rejects', async () => {
        await expect(categoryController.delete(req, res)).rejects.toThrow(
          error,
        );
      });
    });
  });
});
