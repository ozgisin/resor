const {
  ExtendableError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  fromObject,
  fromJSON,
} = require('.');

describe('Errors', () => {
  describe('ExtendableError', () => {
    let generalError;
    let childError;

    beforeEach(() => {
      generalError = new Error('General Error');
      childError = new NotFoundError();
    });

    it('should throw when used directly', () =>
      expect(() => new ExtendableError('Test message')).toThrow(
        'ExtendableError is not meant to be used directly.',
      ));
    it('verifies that general error is not an instance of ExtendableError', () =>
      expect(generalError).not.toBeInstanceOf(ExtendableError));
    it('verifies that instances of different child classes are not instances of each other classes', () =>
      expect(childError).not.toBeInstanceOf(AuthorizationError));
    it('verifies that instance of a child class is an instance of ExtendableError', () =>
      expect(childError).toBeInstanceOf(ExtendableError));
  });

  describe('AuthenticationError', () => {
    let error;

    beforeEach(() => {
      error = new AuthenticationError('Test message');
    });

    it('has expected name', () =>
      expect(error.name).toEqual('AuthenticationError'));
    it('has expected message', () =>
      expect(error.message).toEqual('Test message'));
    it('is instance of expected error', () =>
      expect(error).toBeInstanceOf(AuthenticationError));
    it('is instance of ExtendableError', () =>
      expect(error).toBeInstanceOf(ExtendableError));
    it('serializes correctly', () =>
      expect(JSON.stringify(error)).toBe(
        '{"name":"AuthenticationError","message":"Test message","status":401}',
      ));
  });

  describe('AuthorizationError', () => {
    let error;

    beforeEach(() => {
      error = new AuthorizationError('Test message');
    });

    it('has expected name', () =>
      expect(error.name).toEqual('AuthorizationError'));
    it('has expected message', () =>
      expect(error.message).toEqual('Test message'));
    it('is instance of expected error', () =>
      expect(error).toBeInstanceOf(AuthorizationError));
    it('is instance of ExtendableError', () =>
      expect(error).toBeInstanceOf(ExtendableError));
    it('serializes correctly', () =>
      expect(JSON.stringify(error)).toBe(
        '{"name":"AuthorizationError","message":"Test message","status":403}',
      ));
  });

  describe('NotFoundError', () => {
    let error;

    beforeEach(() => {
      error = new NotFoundError('Test message');
    });

    it('has expected name', () => expect(error.name).toEqual('NotFoundError'));
    it('has expected message', () =>
      expect(error.message).toEqual('Test message'));
    it('is instance of expected error class', () =>
      expect(error).toBeInstanceOf(NotFoundError));
    it('is instance of ExtendableError', () =>
      expect(error).toBeInstanceOf(ExtendableError));
    it('serializes correctly', () =>
      expect(JSON.stringify(error)).toBe(
        '{"name":"NotFoundError","message":"Test message","status":404}',
      ));
  });

  describe('ValidationError', () => {
    describe('errors array given in parameters', () => {
      let error;
      let errors;

      beforeEach(() => {
        errors = [{path: 'some.path', message: 'Is required'}];
        error = new ValidationError('Test message', errors);
      });

      it('has expected name', () =>
        expect(error.name).toEqual('ValidationError'));
      it('has expected message', () =>
        expect(error.message).toEqual('Test message'));
      it('has expected errors', () => expect(error.errors).toBe(errors));
      it('is instance of expected error', () =>
        expect(error).toBeInstanceOf(ValidationError));
      it('is instance of ExtendableError', () =>
        expect(error).toBeInstanceOf(ExtendableError));
      it('serializes correctly', () =>
        expect(JSON.stringify(error)).toBe(
          '{"name":"ValidationError","message":"Test message","status":400,"errors":[{"path":"some.path","message":"Is required"}]}',
        ));
    });

    describe('no errors array given in parameters', () => {
      let error;

      beforeEach(() => {
        error = new ValidationError('Test message');
      });

      it('has default for errors', () => expect(error.errors).toEqual([]));
    });

    describe('non-array errors given in parameters', () => {
      let error;
      let errors;

      beforeEach(() => {
        errors = new Error('Test Error');
        error = new ValidationError('Test message', errors);
      });

      it('wraps errors in an array', () =>
        expect(error.errors).toEqual([errors]));
    });
  });

  describe('fromObject', () => {
    let error;

    beforeEach(() => {
      error = fromObject({
        name: 'AuthenticationError',
        message: 'Test message',
        status: 401,
      });
    });

    it('returns instance of specified error class', () =>
      expect(error).toBeInstanceOf(AuthenticationError));
    it('returns properly initialized instance', () =>
      expect(error).toMatchObject({
        status: 401,
        name: 'AuthenticationError',
        message: 'Test message',
      }));
  });

  describe('fromJSON', () => {
    describe('when error type described in name field', () => {
      it('deserializes legacy error without a message', () =>
        expect(fromJSON('{"name":"AuthenticationError"}')).toMatchObject({
          status: 401,
          name: 'AuthenticationError',
        }));

      it('deserializes AuthenticationError properly', () =>
        expect(
          fromJSON('{"name":"AuthenticationError","message":"Test message"}'),
        ).toMatchObject({
          status: 401,
          name: 'AuthenticationError',
          message: 'Test message',
        }));

      it('deserializes AuthorizationError properly', () =>
        expect(
          fromJSON('{"name":"AuthorizationError","message":"Test message"}'),
        ).toMatchObject({
          status: 403,
          name: 'AuthorizationError',
          message: 'Test message',
        }));

      it('deserializes NotFoundError properly', () =>
        expect(
          fromJSON('{"name":"NotFoundError","message":"Test message"}'),
        ).toMatchObject({
          status: 404,
          name: 'NotFoundError',
          message: 'Test message',
        }));

      it('deserializes ValidationError properly', () =>
        expect(
          fromJSON(
            '{"name":"ValidationError","message":"Test message","errors":[{"path":"some.path","message":"Is required"}]}',
          ),
        ).toMatchObject({
          status: 400,
          name: 'ValidationError',
          message: 'Test message',
          errors: [{path: 'some.path', message: 'Is required'}],
        }));
    });

    describe('when error type described in status field', () => {
      it('deserializes AuthenticationError properly', () =>
        expect(
          fromJSON('{"message":"Test message","status":401}'),
        ).toMatchObject({
          status: 401,
          name: 'AuthenticationError',
          message: 'Test message',
        }));

      it('deserializes AuthorizationError properly', () =>
        expect(
          fromJSON('{"message":"Test message","status":403}'),
        ).toMatchObject({
          status: 403,
          name: 'AuthorizationError',
          message: 'Test message',
        }));

      it('deserializes NotFoundError properly', () =>
        expect(
          fromJSON('{"message":"Test message","status":404}'),
        ).toMatchObject({
          status: 404,
          name: 'NotFoundError',
          message: 'Test message',
        }));

      it('deserializes ValidationError properly', () =>
        expect(
          fromJSON(
            '{"message":"Test message","status":400,"errors":[{"path":"some.path","message":"Is required"}]}',
          ),
        ).toMatchObject({
          status: 400,
          name: 'ValidationError',
          message: 'Test message',
          errors: [{path: 'some.path', message: 'Is required'}],
        }));
    });
  });
});
