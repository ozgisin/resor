const status = require('http-status');
const AuthenticationController = require('.');
const {AuthenticationError} = require('../errors');
const {ROLES} = require('../../../constants');

describe('AuthenticationController', () => {
  let User;
  let bcrypt;
  let config;
  let jwt;
  let mockResponse;
  let res;

  beforeEach(() => {
    User = {findOne: jest.fn(), create: jest.fn()};
    bcrypt = {hash: jest.fn(), genSalt: jest.fn()};
    jwt = {sign: jest.fn()};
    config = {token: {secret: 'test-secret', expiration: '1h'}};
    mockResponse = {json: jest.fn()};
    res = {status: jest.fn().mockReturnValue(mockResponse)};
  });

  describe('constructor', () => {
    let authController;

    beforeEach(() => {
      authController = new AuthenticationController(
        {User},
        {config, bcrypt, jwt},
      );
    });

    it('initialized the class members', () => {
      expect(authController.User).toBe(User);
      expect(authController.config).toBe(config);
      expect(authController.bcrypt).toBe(bcrypt);
      expect(authController.jwt).toBe(jwt);
    });
  });

  describe('register', () => {
    let authController;
    let req;
    let user;
    let encryptedPassword;
    let token;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when registration is successful', () => {
      beforeEach(async () => {
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          role: ROLES.USER,
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(user),
        };
        encryptedPassword = 'encrypted-password';
        bcrypt = {
          genSalt: jest.fn().mockResolvedValue('salt'),
          hash: jest.fn().mockResolvedValue(encryptedPassword),
        };
        token = 'test-token';
        jwt = {sign: jest.fn().mockResolvedValue(token)};
        authController = new AuthenticationController(
          {User},
          {config, bcrypt, jwt},
        );

        await authController.register(req, res);
      });

      it('calls User.findOne with correct params', () => {
        expect(authController.User.findOne).toHaveBeenCalledWith({
          email: user.email,
        });
      });

      it('calls bcrypt.genSalt', () => {
        expect(authController.bcrypt.genSalt).toHaveBeenCalled();
      });

      it('calls bcrypt.hash with correct params', () => {
        expect(authController.bcrypt.hash).toHaveBeenCalledWith(
          req.body.password,
          'salt',
        );
      });

      it('calls User.create with correct params', () => {
        expect(authController.User.create).toHaveBeenCalledWith({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: encryptedPassword,
        });
      });

      it('calls jwt.sign with correct params', () => {
        expect(authController.jwt.sign).toHaveBeenCalledWith(
          {
            role: user.role,
          },
          config.token.secret,
          {
            subject: user._id,
            expiresIn: config.token.expiration,
          },
        );
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.CREATED);
        expect(mockResponse.json).toHaveBeenCalledWith({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          token,
        });
      });
    });

    describe('when user already exists in database', () => {
      let error;

      beforeEach(() => {
        error = new AuthenticationError('User already exists. Please Login');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(user),
        };

        authController = new AuthenticationController({User}, {});
      });

      it('throws AuthenticationError with correct message', async () => {
        await expect(authController.register(req, res)).rejects.toThrow(error);
      });
    });

    describe('when User.findOne fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockRejectedValue(error),
        };

        authController = new AuthenticationController({User}, {});
      });

      it('rejects', async () => {
        await expect(authController.register(req, res)).rejects.toThrow(error);
      });
    });

    describe('when bcrypt.genSalt fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
        };

        bcrypt = {
          genSalt: jest.fn().mockRejectedValue(error),
        };
        authController = new AuthenticationController({User}, {bcrypt});
      });

      it('rejects', async () => {
        await expect(authController.register(req, res)).rejects.toThrow(error);
      });
    });

    describe('when bcrypt.hash fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        bcrypt = {
          genSalt: jest.fn().mockResolvedValue('salt'),
          hash: jest.fn().mockRejectedValue(error),
        };
        authController = new AuthenticationController({User}, {bcrypt});
      });

      it('rejects', async () => {
        await expect(authController.register(req, res)).rejects.toThrow(error);
      });
    });

    describe('when User.create fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockRejectedValue(error),
        };
        bcrypt = {
          genSalt: jest.fn().mockResolvedValue('salt'),
          hash: jest.fn().mockResolvedValue('encrypted-password'),
        };
        authController = new AuthenticationController({User}, {bcrypt});
      });

      it('rejects', async () => {
        await expect(authController.register(req, res)).rejects.toThrow(error);
      });
    });

    describe('when jwt.sign fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          role: ROLES.USER,
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            ...user,
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(user),
        };
        bcrypt = {
          genSalt: jest.fn().mockResolvedValue('salt'),
          hash: jest.fn().mockResolvedValue('encrypted-password'),
        };
        jwt = {
          sign: jest.fn().mockRejectedValue(error),
        };
        authController = new AuthenticationController(
          {User},
          {bcrypt, jwt, config},
        );
      });

      it('rejects', async () => {
        await expect(authController.register(req, res)).rejects.toThrow(error);
      });
    });
  });

  describe('login', () => {
    let authController;
    let req;
    let user;
    let token;

    afterEach(() => {
      mockResponse.json.mockClear();
    });

    describe('when login is successful', () => {
      beforeEach(async () => {
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          password: 'password',
          role: ROLES.USER,
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            email: 'test@email.com',
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(user),
        };

        bcrypt = {
          compare: jest.fn().mockResolvedValue(true),
        };
        token = 'test-token';
        jwt = {sign: jest.fn().mockResolvedValue(token)};
        authController = new AuthenticationController(
          {User},
          {config, bcrypt, jwt},
        );

        await authController.login(req, res);
      });

      it('calls User.findOne with correct params', () => {
        expect(authController.User.findOne).toHaveBeenCalledWith({
          email: req.body.email,
        });
      });

      it('calls bcrypt.compare with correct params', () => {
        expect(authController.bcrypt.compare).toHaveBeenCalledWith(
          req.body.password,
          user.password,
        );
      });

      it('calls jwt.sign with correct params', () => {
        expect(authController.jwt.sign).toHaveBeenCalledWith(
          {
            role: user.role,
          },
          config.token.secret,
          {
            subject: user._id,
            expiresIn: config.token.expiration,
          },
        );
      });

      it('retuns correct response', () => {
        expect(res.status).toHaveBeenCalledWith(status.OK);
        expect(mockResponse.json).toHaveBeenCalledWith({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          token,
        });
      });
    });

    describe('when user does not exist', () => {
      let error;

      beforeEach(() => {
        error = new AuthenticationError('Invalid credentials');
        req = {
          body: {
            email: 'test@email.com',
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
        };

        authController = new AuthenticationController({User}, {});
      });

      it('rejects', async () => {
        await expect(authController.login(req, res)).rejects.toThrow(error);
      });
    });

    describe('when password is invalid', () => {
      let error;

      beforeEach(() => {
        error = new AuthenticationError('Invalid credentials');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          password: 'password',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            email: 'test@email.com',
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        bcrypt = {
          compare: jest.fn().mockResolvedValue(false),
        };

        authController = new AuthenticationController({User}, {bcrypt});
      });

      it('rejects', async () => {
        await expect(authController.login(req, res)).rejects.toThrow(error);
      });
    });

    describe('when User.findOne fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          password: 'password',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            email: 'test@email.com',
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockRejectedValue(error),
        };

        authController = new AuthenticationController({User}, {});
      });

      it('rejects', async () => {
        await expect(authController.login(req, res)).rejects.toThrow(error);
      });
    });

    describe('when bcrypt.compare fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          password: 'password',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            email: 'test@email.com',
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(user),
        };
        bcrypt = {
          compare: jest.fn().mockRejectedValue(error),
        };
        authController = new AuthenticationController({User}, {bcrypt});
      });

      it('rejects', async () => {
        await expect(authController.login(req, res)).rejects.toThrow(error);
      });
    });

    describe('when jwt.sign fails', () => {
      let error;

      beforeEach(() => {
        error = new Error('Test Error');
        user = {
          _id: 'test-user-id',
          firstName: 'test-name',
          lastName: 'test-surname',
          email: 'test@email.com',
          password: 'password',
          createdAt: new Date(1000),
          updatedAt: new Date(1000),
        };
        req = {
          body: {
            email: 'test@email.com',
            password: 'password',
          },
        };
        User = {
          findOne: jest.fn().mockResolvedValue(user),
        };
        bcrypt = {
          compare: jest.fn().mockResolvedValue(true),
        };
        jwt = {
          sign: jest.fn().mockRejectedValue(error),
        };
        authController = new AuthenticationController(
          {User},
          {bcrypt, jwt, config},
        );
      });

      it('rejects', async () => {
        await expect(authController.login(req, res)).rejects.toThrow(error);
      });
    });
  });
});
