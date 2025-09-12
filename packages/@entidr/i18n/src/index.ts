// i18n exports for @entidr/i18n
// This is a temporary file - will be populated with actual i18n modules later

export const EntidrI18n = {
  version: '1.0.0',
  name: '@entidr/i18n'
};

// Basic exports for now
export const createI18n = () => {
  return {
    init: () => console.log('Entidr I18n initialized'),
    getVersion: () => '1.0.0'
  };
};
