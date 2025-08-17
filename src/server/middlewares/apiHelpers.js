'use strict';

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const validate = (validationFn) => (req, res, next) => {
  const { isValid, errors } = validationFn(req.body);
  if (!isValid) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation error',
      errors
    });
  }
  next();
};

module.exports = {
  asyncHandler,
  validate
};
