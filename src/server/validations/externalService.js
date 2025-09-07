const { body } = require('express-validator');

const externalServiceSchema = [
  body('name')
    .notEmpty()
    .withMessage('Le nom du service est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  body('type')
    .notEmpty()
    .withMessage('Le type de service est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le type doit contenir entre 2 et 50 caractères'),

  body('apiKey')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La clé API ne doit pas dépasser 500 caractères'),

  body('apiSecret')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Le secret API ne doit pas dépasser 500 caractères'),

  body('baseUrl')
    .optional()
    .isURL()
    .withMessage('L\'URL de base doit être une URL valide'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen'),

  body('mode')
    .optional()
    .isIn(['test', 'production'])
    .withMessage('Le mode doit être "test" ou "production"')
];

module.exports = {
  externalServiceSchema
};
