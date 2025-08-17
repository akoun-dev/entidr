import { errorHandler } from '../src/server/middlewares/errorMiddleware';
import { ApiError } from '../src/utils/ApiError';

// Mock Express objects
const mockRequest = {};
const mockResponse = {
  status: (code: number) => ({
    json: (data: any) => {
      console.log(`Status: ${code}, Response:`, data);
      return true;
    }
  })
};
const mockNext = () => {};

// Test operational error
console.log('Testing operational error:');
const operationalError = new ApiError('Test operational error', 400);
errorHandler(operationalError, mockRequest as any, mockResponse as any, mockNext);

// Test non-operational error
console.log('\nTesting non-operational error:');
const genericError = new Error('Test generic error');
errorHandler(genericError, mockRequest as any, mockResponse as any, mockNext);

console.log('\nAll tests completed');
