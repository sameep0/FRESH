
require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || 3000;

jest.setTimeout(10000);

const originalConsoleLog = console.log;
console.log = (...args) => {
  if (process.env.DEBUG_TESTS) {
    originalConsoleLog(...args);
  }
};

afterAll(async () => {

  console.log = originalConsoleLog;
}); 