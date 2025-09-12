// Security exports for @entidr/security
// This is a temporary file - will be populated with actual security modules later

export const EntidrSecurity = {
  version: '1.0.0',
  name: '@entidr/security'
};

// Basic exports for now
export const createSecurity = () => {
  return {
    init: () => console.log('Entidr Security initialized'),
    getVersion: () => '1.0.0'
  };
};
