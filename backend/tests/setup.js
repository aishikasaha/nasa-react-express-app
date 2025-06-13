// Test setup and global configurations
process.env.NODE_ENV = 'test';
process.env.NASA_API_KEY = 'TEST_KEY';
process.env.PORT = '5001';

// Mock console methods in tests
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Global test timeout
jest.setTimeout(10000);
