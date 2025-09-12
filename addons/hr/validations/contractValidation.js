const { body } = require('express-validator');

// Validation pour la création d'un contrat
exports.createContractValidation = [
  body('employee_id')
    .notEmpty()
    .withMessage('L\'employé est requis')
    .isMongoId()
    .withMessage('ID d\'employé invalide'),

  body('type')
    .notEmpty()
    .withMessage('Le type de contrat est requis')
    .isIn(['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'internship', 'apprenticeship', 'other'])
    .withMessage('Type de contrat invalide'),

  body('reference')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La référence ne peut pas dépasser 50 caractères')
    .trim(),

  body('start_date')
    .notEmpty()
    .withMessage('La date de début est requise')
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      return true;
    }),

  body('salary')
    .notEmpty()
    .withMessage('Le salaire est requis')
    .isFloat({ min: 0 })
    .withMessage('Le salaire doit être un nombre positif'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La devise doit être un code de 3 caractères')
    .trim(),

  body('working_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le nombre d\'heures de travail doit être un nombre positif'),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'terminated', 'expired', 'renewed'])
    .withMessage('Statut de contrat invalide'),

  body('terms')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Les conditions ne peuvent pas dépasser 2000 caractères')
    .trim()
];

// Validation pour la mise à jour d'un contrat
exports.updateContractValidation = [
  body('employee_id')
    .optional()
    .isMongoId()
    .withMessage('ID d\'employé invalide'),

  body('type')
    .optional()
    .isIn(['cdi', 'cdd', 'stage', 'alternance', 'freelance', 'internship', 'apprenticeship', 'other'])
    .withMessage('Type de contrat invalide'),

  body('reference')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La référence ne peut pas dépasser 50 caractères')
    .trim(),

  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      return true;
    }),

  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le salaire doit être un nombre positif'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('La devise doit être un code de 3 caractères')
    .trim(),

  body('working_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le nombre d\'heures de travail doit être un nombre positif'),

  body('status')
    .optional()
    .isIn(['draft', 'active', 'terminated', 'expired', 'renewed'])
    .withMessage('Statut de contrat invalide'),

  body('terms')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Les conditions ne peuvent pas dépasser 2000 caractères')
    .trim()
];

// Validation pour la mise à jour du statut d'un contrat
exports.updateContractStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Le statut est requis')
    .isIn(['draft', 'active', 'terminated', 'expired', 'renewed'])
    .withMessage('Statut de contrat invalide')
];
