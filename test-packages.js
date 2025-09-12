// Test script to verify that all @entidr packages are accessible
console.log('Testing Entidr packages...\n');

try {
  // Test @entidr/core
  const { EntidrCore, createCore } = require('./packages/@entidr/core/dist/index.js');
  console.log('✅ @entidr/core loaded successfully');
  console.log(`   Version: ${EntidrCore.version}`);
  console.log(`   Name: ${EntidrCore.name}`);

  const core = createCore();
  core.init();
  console.log('   Core functionality working\n');
} catch (error) {
  console.log('❌ @entidr/core failed to load:', error.message);
}

try {
  // Test @entidr/ui
  const { EntidrUI, createUI } = require('./packages/@entidr/ui/dist/index.js');
  console.log('✅ @entidr/ui loaded successfully');
  console.log(`   Version: ${EntidrUI.version}`);
  console.log(`   Name: ${EntidrUI.name}`);

  const ui = createUI();
  ui.init();
  console.log('   UI functionality working\n');
} catch (error) {
  console.log('❌ @entidr/ui failed to load:', error.message);
}

try {
  // Test @entidr/hooks
  const { EntidrHooks, createHooks } = require('./packages/@entidr/hooks/dist/index.js');
  console.log('✅ @entidr/hooks loaded successfully');
  console.log(`   Version: ${EntidrHooks.version}`);
  console.log(`   Name: ${EntidrHooks.name}`);

  const hooks = createHooks();
  hooks.init();
  console.log('   Hooks functionality working\n');
} catch (error) {
  console.log('❌ @entidr/hooks failed to load:', error.message);
}

try {
  // Test @entidr/security
  const { EntidrSecurity, createSecurity } = require('./packages/@entidr/security/dist/index.js');
  console.log('✅ @entidr/security loaded successfully');
  console.log(`   Version: ${EntidrSecurity.version}`);
  console.log(`   Name: ${EntidrSecurity.name}`);

  const security = createSecurity();
  security.init();
  console.log('   Security functionality working\n');
} catch (error) {
  console.log('❌ @entidr/security failed to load:', error.message);
}

try {
  // Test @entidr/i18n
  const { EntidrI18n, createI18n } = require('./packages/@entidr/i18n/dist/index.js');
  console.log('✅ @entidr/i18n loaded successfully');
  console.log(`   Version: ${EntidrI18n.version}`);
  console.log(`   Name: ${EntidrI18n.name}`);

  const i18n = createI18n();
  i18n.init();
  console.log('   I18n functionality working\n');
} catch (error) {
  console.log('❌ @entidr/i18n failed to load:', error.message);
}

console.log('🎉 Entidr packages test completed!');
