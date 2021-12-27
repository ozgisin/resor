const status = require('http-status');
const FoodController = require('.');
const {NotFoundError} = require('../errors');

describe('FoodController', () => {
  let Food;
  let Category;
  let mockResponse;
  let res;

  beforeEach(() => {
    Food = {
      find: jest.fn(),
      findById: jest.fn(),
    };
    Category = {
      findById: jest.fn(),
    };
    mockResponse = {json: jest.fn()};
    res = {status: jest.fn().mockReturnValue(mockResponse)};
  });

  describe('constructor', () => {
    let foodController;

    beforeEach(() => {
      foodController = new FoodController({Food, Category});
    });

    it('initializes the class members', () => {
      expect(foodController.Food).toBe(Food);
      expect(foodController.Category).toBe(Category);
    });
  });

  describe('findOne', () => {
    let foodController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let food;

      beforeEach(async () => {
        req = {
          params: {
            foodId: 'test-food-id',
          },
        };
        food = {
          _id: 'test-food-id',
          title: 'Test Food',
          categoryId: 'test-category-id',
        };
        Food = {findById: jest.fn().mockResolvedValue(food)};

        foodController = new FoodController({Food});

        await foodController.findOne(req, res);
      });

      it('calls Food.findById with correct params', () => {
        expect(foodController.Food.findById).toHaveBeenCalledWith(
          'test-food-id',
        );
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.OK);
        expect(mockResponse.json).toHaveBeenCalledWith(food);
      });
    });

    describe('when food does not exist in database', () => {
      let error;

      beforeEach(() => {
        error = new NotFoundError();
        req = {
          params: {
            foodId: 'test-food-id',
          },
        };
        Food = {findById: jest.fn().mockResolvedValue(null)};

        foodController = new FoodController({Food});
      });

      it('throws NotFoundError', async () => {
        await expect(foodController.findOne(req, res)).rejects.toThrow(error);
      });
    });

    describe('when Food.findById fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {
          params: {
            foodId: 'test-food-id',
          },
        };
        Food = {findById: jest.fn().mockRejectedValue(error)};

        foodController = new FoodController({Food});
      });

      it('rejects', async () => {
        await expect(foodController.findOne(req, res)).rejects.toThrow(error);
      });
    });
  });

  describe('find', () => {
    let foodController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let food;

      beforeEach(async () => {
        req = {params: {categoryId: 'test-category-id'}};
        food = {
          _id: 'test-food-id',
          cateogryId: 'test-category-id',
          title: 'Test Category',
        };
        Food = {find: jest.fn().mockResolvedValue([food])};
        foodController = new FoodController({Food});

        await foodController.find(req, res);
      });

      it('calls Food.find with correct params', () => {
        expect(foodController.Food.find).toHaveBeenCalledWith({
          categoryId: req.params.categoryId,
        });
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.OK);
        expect(mockResponse.json).toHaveBeenCalledWith([food]);
      });
    });

    describe('when Food.find fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {params: {categoryId: 'test-category-id'}};
        Food = {find: jest.fn().mockRejectedValue(error)};
        foodController = new FoodController({Food});
      });

      it('rejects', async () => {
        await expect(foodController.find(req, res)).rejects.toThrow(error);
      });
    });
  });

  describe('create', () => {
    let foodController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let food;
      let category;

      beforeEach(async () => {
        food = {
          title: 'Test Food',
          price: 100,
        };
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          addFoods: jest
            .fn()
            .mockResolvedValue([{categoryId: 'test-category-id', ...food}]),
        };
        req = {
          params: {categoryId: 'test-category-id'},
          body: [food],
        };
        Category = {
          findById: jest.fn().mockResolvedValue(category),
        };
        foodController = new FoodController({Food, Category});

        await foodController.create(req, res);
      });

      it('calls Category.findById with correct params', () => {
        expect(foodController.Category.findById).toHaveBeenCalledWith(
          req.params.categoryId,
        );
      });

      it('calls category.addFoods with correct params', () => {
        expect(category.addFoods).toHaveBeenCalledWith(req.body);
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.CREATED);
        expect(mockResponse.json).toHaveBeenCalledWith([
          {categoryId: 'test-category-id', ...food},
        ]);
      });
    });

    describe('when Category.findById fails', () => {
      let error;
      let food;

      beforeEach(() => {
        error = new Error('Test Error');
        food = {
          title: 'Test Food',
          price: 100,
        };
        req = {
          params: {categoryId: 'test-category-id'},
          body: [food],
        };
        Category = {findById: jest.fn().mockRejectedValue(error)};
        foodController = new FoodController({Food, Category});
      });

      it('rejects', async () => {
        await expect(foodController.create(req, res)).rejects.toThrow(error);
      });
    });

    describe('when category.addFoods fails', () => {
      let food;
      let category;
      let error;

      beforeEach(async () => {
        error = new Error('Test Error');
        food = {
          title: 'Test Food',
          price: 100,
        };
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          addFoods: jest.fn().mockRejectedValue(error),
        };
        req = {
          params: {categoryId: 'test-category-id'},
          body: [food],
        };
        Category = {
          findById: jest.fn().mockResolvedValue(category),
        };
        foodController = new FoodController({Food, Category});
      });

      it('rejects', async () => {
        await expect(foodController.create(req, res)).rejects.toThrow(error);
      });
    });

    describe('when category does not exist in database', () => {
      let error;
      let food;

      beforeEach(() => {
        error = new NotFoundError();
        food = {
          title: 'Test Food',
          price: 100,
        };
        req = {
          params: {categoryId: 'test-category-id'},
          body: [food],
        };
        Category = {findById: jest.fn().mockResolvedValue(null)};
        foodController = new FoodController({Food, Category});
      });

      it('rejects', async () => {
        await expect(foodController.create(req, res)).rejects.toThrow(error);
      });
    });
  });

  describe('delete', () => {
    let foodController;
    let req;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when everything is successful', () => {
      let category;

      beforeEach(async () => {
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          removeFood: jest.fn().mockResolvedValue(),
        };
        req = {
          params: {categoryId: 'test-category-id', foodId: 'test-food-id'},
        };
        Category = {
          findById: jest.fn().mockResolvedValue(category),
        };
        foodController = new FoodController({Food, Category});

        await foodController.delete(req, res);
      });

      it('calls Category.findById with correct params', () => {
        expect(foodController.Category.findById).toHaveBeenCalledWith(
          req.params.categoryId,
        );
      });

      it('calls category.removeFood with correct params', () => {
        expect(category.removeFood).toHaveBeenCalledWith(req.params.foodId);
      });

      it('returns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.NO_CONTENT);
        expect(mockResponse.json).toHaveBeenCalled();
      });
    });

    describe('when Category.findById fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        req = {
          params: {categoryId: 'test-category-id', foodId: 'test-food-id'},
        };
        Category = {findById: jest.fn().mockRejectedValue(error)};
        foodController = new FoodController({Food, Category});
      });

      it('rejects', async () => {
        await expect(foodController.delete(req, res)).rejects.toThrow(error);
      });
    });

    describe('when category.removeFood fails', () => {
      let category;
      let error;

      beforeEach(async () => {
        error = new Error('Test Error');
        category = {
          _id: 'test-category-id',
          title: 'Test Category',
          removeFood: jest.fn().mockRejectedValue(error),
        };
        req = {
          params: {categoryId: 'test-category-id', foodId: 'test-food-id'},
        };
        Category = {
          findById: jest.fn().mockResolvedValue(category),
        };
        foodController = new FoodController({Food, Category});
      });

      it('rejects', async () => {
        await expect(foodController.delete(req, res)).rejects.toThrow(error);
      });
    });

    describe('when category does not exist in database', () => {
      let error;

      beforeEach(() => {
        error = new NotFoundError();
        req = {
          params: {categoryId: 'test-category-id', foodId: 'test-food-id'},
        };
        Category = {findById: jest.fn().mockResolvedValue(null)};
        foodController = new FoodController({Food, Category});
      });

      it('rejects', async () => {
        await expect(foodController.delete(req, res)).rejects.toThrow(error);
      });
    });
  });
});
