const { body } = require('express-validator');

const securitySettingSchema = [
  body('key')
    .notEmpty()
    .withMessage('La clé du paramètre est requise')
    .isLength({ min: 2, max: 50 })
    .withMessage('La clé doit contenir entre 2 et 50 caractères'),

  body('value')
    .notEmpty()
    .withMessage('La valeur du paramètre est requise')
    .isLength({ max: 1000 })
    .withMessage('La valeur ne doit pas dépasser 1000 caractères'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne doit pas dépasser 500 caractères'),

  body('valueType')
    .optional()
    .isIn(['string', 'boolean', 'number', 'json'])
    .withMessage('Le type de valeur doit être string, boolean, number ou json'),

  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La catégorie ne doit pas dépasser 50 caractères')
];

module.exports = {
  securitySettingSchema
};
