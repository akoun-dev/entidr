const successResponse = (res, statusCode, data = null, message = null) => {
  const response = {
    success: true,
    message: message || getDefaultMessage(statusCode)
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message: message || getDefaultErrorMessage(statusCode)
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const getDefaultMessage = (statusCode) => {
  const messages = {
    200: 'Request successful',
    201: 'Resource created successfully',
    204: 'Resource deleted successfully'
  };
  return messages[statusCode] || 'Operation successful';
};

const getDefaultErrorMessage = (statusCode) => {
  const messages = {
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Resource not found',
    500: 'Internal server error'
  };
  return messages[statusCode] || 'An error occurred';
};

module.exports = {
  successResponse,
  errorResponse
};
