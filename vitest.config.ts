/// <reference types="vitest" />

export default {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true
  }
}
