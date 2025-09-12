// Custom hooks exports for @entidr/hooks
// This is a temporary file - will be populated with actual hooks later

export const EntidrHooks = {
  version: '1.0.0',
  name: '@entidr/hooks'
};

// Basic exports for now
export const createHooks = () => {
  return {
    init: () => console.log('Entidr Hooks initialized'),
    getVersion: () => '1.0.0'
  };
};
