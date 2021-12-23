module.exports = (handler, method) => async (request, response, next) => {
  try {
    await handler[method](request, response, next);
    next();
  } catch (error) {
    next(error);
  }
};
