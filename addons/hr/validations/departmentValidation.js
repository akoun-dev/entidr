const { body } = require('express-validator');

// Validation pour la création d'un département
exports.createDepartmentValidation = [
  body('name')
    .notEmpty()
    .withMessage('Le nom du département est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du département doit contenir entre 2 et 100 caractères')
    .trim(),

  body('code')
    .notEmpty()
    .withMessage('Le code du département est requis')
    .isLength({ min: 2, max: 20 })
    .withMessage('Le code du département doit contenir entre 2 et 20 caractères')
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage('Le code ne peut contenir que des lettres, des chiffres, des tirets et des underscores')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .trim(),

  body('manager_id')
    .optional()
    .isMongoId()
    .withMessage('ID de manager invalide'),

  body('parent_id')
    .optional()
    .isMongoId()
    .withMessage('ID de département parent invalide'),

  body('active')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen')
];

// Validation pour la mise à jour d'un département
exports.updateDepartmentValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du département doit contenir entre 2 et 100 caractères')
    .trim(),

  body('code')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('Le code du département doit contenir entre 2 et 20 caractères')
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage('Le code ne peut contenir que des lettres, des chiffres, des tirets et des underscores')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .trim(),

  body('manager_id')
    .optional()
    .isMongoId()
    .withMessage('ID de manager invalide'),

  body('parent_id')
    .optional()
    .isMongoId()
    .withMessage('ID de département parent invalide'),

  body('active')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen')
];
