const {AuthenticationError} = require('../errors');

class AuthenticationController {
  constructor({User}, {config, bcrypt, jwt}) {
    this.User = User;
    this.config = config;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  async register(req, res) {
    const {
      body: {firstName, lastName, email, password},
    } = req;

    const oldUser = await this.User.findOne({email});
    if (oldUser) {
      throw new AuthenticationError('User already exists. Please Login');
    }

    const salt = await this.bcrypt.genSalt();

    const encryptedPassword = await this.bcrypt.hash(password, salt);

    const user = await this.User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = await this.jwt.sign(
      {
        userId: user._id,
        email,
      },
      this.config.token.secret,
      {
        expiresIn: this.config.token.expiration,
      },
    );

    user.token = token;

    return res.status(201).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    });
  }

  async login(req, res) {
    const {
      body: {email, password},
    } = req;

    const user = await this.User.findOne({email});
    if (user && (await this.bcrypt.compare(password, user.password))) {
      const token = await this.jwt.sign(
        {
          userId: user._id,
          email,
        },
        this.config.token.secret,
        {
          expiresIn: this.config.token.expiration,
        },
      );

      user.token = token;

      return res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token,
      });
    }
    throw new AuthenticationError('Invalid credentials');
  }
}

module.exports = AuthenticationController;
