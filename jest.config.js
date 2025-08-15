module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/scripts/',
    '/tests/api/',
    '/tests/connectors.test.js',
    '/tests/editor.test.js',
    '/tests/engine.test.js',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
