import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './errorMiddleware';
import { ApiError } from '../../utils/ApiError';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn(() => ({ json: responseJson }));

    mockRequest = {};
    mockResponse = {
      status: responseStatus,
    };
    mockNext = jest.fn();
  });

  it('should handle operational errors with custom status code', () => {
    const err = new ApiError('Test error', 400);
    errorHandler(err, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(400);
    expect(responseJson).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 400,
      message: 'Test error'
    });
  });

  it('should handle non-operational errors with generic message', () => {
    const err = new Error('Test error');
    errorHandler(err, mockRequest as Request, mockResponse as Response, mockNext);

    expect(responseStatus).toHaveBeenCalledWith(500);
    expect(responseJson).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Une erreur est survenue'
    });
  });

  it('should log errors to winston', () => {
    const errorSpy = jest.spyOn(console, 'error');
    const err = new Error('Test error');

    errorHandler(err, mockRequest as Request, mockResponse as Response, mockNext);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
