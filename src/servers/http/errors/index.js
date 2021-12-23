class ExtendableError extends Error {
  constructor(message) {
    super(message);

    if (this.constructor.name === 'ExtendableError') {
      throw new Error('ExtendableError is not meant to be used directly.');
    }
    this.name = this.constructor.name;
  }

  static [Symbol.hasInstance](instance) {
    let proto = instance;
    while (proto) {
      if (proto.name === this.name) {
        return true;
      }
      if (proto.constructor && proto.constructor.name === this.name) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }
    return false;
  }

  toJSON() {
    return {
      name: this.constructor.name,
      message: this.message,
      status: this.status,
      errors: this.errors,
    };
  }
}

class AuthenticationError extends ExtendableError {
  constructor(message) {
    super(message);
    this.status = 401;
  }
}

class AuthorizationError extends ExtendableError {
  constructor(message) {
    super(message);
    this.status = 403;
  }
}

class NotFoundError extends ExtendableError {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

class ValidationError extends ExtendableError {
  constructor(message, errors = []) {
    super(message);
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.status = 400;
  }
}

const fromObject = (error) => {
  const {status, name, message, errors} = error;
  if (name === 'ValidationError' || status === 400) {
    return new ValidationError(message, errors);
  }
  if (name === 'AuthenticationError' || status === 401) {
    return new AuthenticationError(message);
  }
  if (name === 'AuthorizationError' || status === 403) {
    return new AuthorizationError(message);
  }
  if (name === 'NotFoundError' || status === 404) {
    return new NotFoundError(message);
  }
  throw new Error(
    `Could not deserialize ${JSON.stringify(error)} into matching error class`,
  );
};

const fromJSON = (data) => fromObject(JSON.parse(data));

module.exports = {
  ExtendableError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  fromObject,
  fromJSON,
};
