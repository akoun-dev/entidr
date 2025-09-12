const { body } = require('express-validator');

// Validation pour la création d'un document
exports.createDocumentValidation = [
  body('employee_id')
    .notEmpty()
    .withMessage('L\'employé est requis')
    .isMongoId()
    .withMessage('ID d\'employé invalide'),

  body('name')
    .notEmpty()
    .withMessage('Le nom du document est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du document doit contenir entre 2 et 100 caractères')
    .trim(),

  body('type')
    .notEmpty()
    .withMessage('Le type de document est requis')
    .isIn([
      'id_card', 'passport', 'cv', 'diploma', 'certificate',
      'contract', 'pay_slip', 'medical_certificate', 'insurance',
      'tax_document', 'other'
    ])
    .withMessage('Type de document invalide'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .trim(),

  body('file_url')
    .notEmpty()
    .withMessage('L\'URL du fichier est requise')
    .isURL()
    .withMessage('URL du fichier invalide')
    .trim(),

  body('file_name')
    .notEmpty()
    .withMessage('Le nom du fichier est requis')
    .isLength({ max: 255 })
    .withMessage('Le nom du fichier ne peut pas dépasser 255 caractères')
    .trim(),

  body('mime_type')
    .notEmpty()
    .withMessage('Le type MIME est requis')
    .isLength({ max: 100 })
    .withMessage('Le type MIME ne peut pas dépasser 100 caractères')
    .trim(),

  body('size_bytes')
    .notEmpty()
    .withMessage('La taille du fichier est requise')
    .isInt({ min: 0 })
    .withMessage('La taille du fichier doit être un entier positif'),

  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La date d\'expiration doit être postérieure à la date actuelle');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['draft', 'pending', 'approved', 'rejected', 'expired'])
    .withMessage('Statut de document invalide'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
    .trim()
];

// Validation pour la mise à jour d'un document
exports.updateDocumentValidation = [
  body('employee_id')
    .optional()
    .isMongoId()
    .withMessage('ID d\'employé invalide'),

  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du document doit contenir entre 2 et 100 caractères')
    .trim(),

  body('type')
    .optional()
    .isIn([
      'id_card', 'passport', 'cv', 'diploma', 'certificate',
      'contract', 'pay_slip', 'medical_certificate', 'insurance',
      'tax_document', 'other'
    ])
    .withMessage('Type de document invalide'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères')
    .trim(),

  body('file_url')
    .optional()
    .isURL()
    .withMessage('URL du fichier invalide')
    .trim(),

  body('file_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Le nom du fichier ne peut pas dépasser 255 caractères')
    .trim(),

  body('mime_type')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le type MIME ne peut pas dépasser 100 caractères')
    .trim(),

  body('size_bytes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La taille du fichier doit être un entier positif'),

  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('La date d\'expiration doit être postérieure à la date actuelle');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['draft', 'pending', 'approved', 'rejected', 'expired'])
    .withMessage('Statut de document invalide'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
    .trim()
];
