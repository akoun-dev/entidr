// Core exports for @entidr/core
// This is a temporary file - will be populated with actual modules later

export const EntidrCore = {
  version: '1.0.0',
  name: '@entidr/core'
};

// Basic exports for now
export const createCore = () => {
  return {
    init: () => console.log('Entidr Core initialized'),
    getVersion: () => '1.0.0'
  };
};
