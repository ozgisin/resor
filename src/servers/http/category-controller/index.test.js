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
      findOne: jest.fn(),
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
        Category = {findOne: jest.fn().mockReturnValue(mockResult)};

        categoryController = new CategoryController({Category, Food});

        await categoryController.findOne(req, res);
      });

      it('calls Category.findOne with correct params', () => {
        expect(categoryController.Category.findOne).toHaveBeenCalledWith({
          _id: 'test-category-id',
          archivedAt: null,
        });
      });

      it('calls Category.findOne().populate with correct params', () => {
        expect(mockResult.populate).toHaveBeenCalledWith({
          path: 'foods',
          model: Food,
          select: '_id title imageUrl price',
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
        Category = {findOne: jest.fn().mockReturnValue(mockResult)};

        categoryController = new CategoryController({Category, Food});
      });

      it('throws NotFoundError', async () => {
        await expect(categoryController.findOne(req, res)).rejects.toThrow(
          error,
        );
      });
    });

    describe('when Category.findOne fails', () => {
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
        Category = {findOne: jest.fn().mockReturnValue(mockResult)};

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
        categoryController = new CategoryController({Category, Food});
      });

      it('rejects', async () => {
        await expect(
          categoryController.Category.find(req, res),
        ).rejects.toThrow(error);
      });
    });
  });
});
