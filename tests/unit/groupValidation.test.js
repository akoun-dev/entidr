const { validateGroupCreate } = require('../../src/utils/validators/groupSchemas');

describe('Group Validation', () => {
  test('should reject short group name', () => {
    const { isValid, errors } = validateGroupCreate({ name: 'ab' });
    expect(isValid).toBe(false);
    expect(errors).toContain('Le nom doit contenir entre 3 et 50 caractères');
  });

  test('should accept valid group', () => {
    const { isValid } = validateGroupCreate({ name: 'Valid Group' });
    expect(isValid).toBe(true);
  });
});
