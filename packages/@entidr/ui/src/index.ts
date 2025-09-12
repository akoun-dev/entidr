// UI components exports for @entidr/ui
// This is a temporary file - will be populated with actual components later

export const EntidrUI = {
  version: '1.0.0',
  name: '@entidr/ui'
};

// Basic exports for now
export const createUI = () => {
  return {
    init: () => console.log('Entidr UI initialized'),
    getVersion: () => '1.0.0'
  };
};
