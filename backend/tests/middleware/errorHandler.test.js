const errorHandler = require('../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      originalUrl: '/test',
      method: 'GET'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  test('should handle general errors', () => {
    const error = new Error('Test error');
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal Server Error'
    });
  });

  test('should handle rate limit errors', () => {
    const error = {
      response: { status: 429 }
    };
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'NASA API rate limit exceeded. Please try again later.'
    });
  });

  test('should handle NASA API errors', () => {
    const error = {
      response: { 
        status: 404,
        data: { error: { message: 'Not found' } }
      }
    };
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'NASA API Error: Not found'
    });
  });
});
