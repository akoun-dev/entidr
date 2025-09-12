const { body } = require('express-validator');

// Validation pour la création d'un employé
exports.createEmployeeValidation = [
  body('first_name')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .trim(),

  body('last_name')
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Veuillez fournir un numéro de téléphone valide')
    .trim(),

  body('job_title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le poste ne peut pas dépasser 100 caractères')
    .trim(),

  body('department_id')
    .notEmpty()
    .withMessage('Le département est requis')
    .isMongoId()
    .withMessage('ID de département invalide'),

  body('manager_id')
    .optional()
    .isMongoId()
    .withMessage('ID de manager invalide'),

  body('hire_date')
    .notEmpty()
    .withMessage('La date d\'embauche est requise')
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)'),

  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le salaire doit être un nombre positif'),

  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La rue ne peut pas dépasser 100 caractères')
    .trim(),

  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La ville ne peut pas dépasser 50 caractères')
    .trim(),

  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('L\'état ne peut pas dépasser 50 caractères')
    .trim(),

  body('address.postal_code')
    .optional()
    .isPostalCode()
    .withMessage('Code postal invalide')
    .trim(),

  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Le pays ne peut pas dépasser 50 caractères')
    .trim(),

  body('emergency_contact.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le nom du contact d\'urgence ne peut pas dépasser 100 caractères')
    .trim(),

  body('emergency_contact.relationship')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La relation ne peut pas dépasser 50 caractères')
    .trim(),

  body('emergency_contact.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Numéro de téléphone du contact d\'urgence invalide')
    .trim(),

  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date de naissance invalide (YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Genre invalide'),

  body('photo_url')
    .optional()
    .isURL()
    .withMessage('URL de photo invalide')
    .trim(),

  body('active')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen')
];

// Validation pour la mise à jour d'un employé
exports.updateEmployeeValidation = [
  body('first_name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .trim(),

  body('last_name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Veuillez fournir un numéro de téléphone valide')
    .trim(),

  body('job_title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le poste ne peut pas dépasser 100 caractères')
    .trim(),

  body('department_id')
    .optional()
    .isMongoId()
    .withMessage('ID de département invalide'),

  body('manager_id')
    .optional()
    .isMongoId()
    .withMessage('ID de manager invalide'),

  body('hire_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide (YYYY-MM-DD)'),

  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le salaire doit être un nombre positif'),

  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La rue ne peut pas dépasser 100 caractères')
    .trim(),

  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La ville ne peut pas dépasser 50 caractères')
    .trim(),

  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('L\'état ne peut pas dépasser 50 caractères')
    .trim(),

  body('address.postal_code')
    .optional()
    .isPostalCode()
    .withMessage('Code postal invalide')
    .trim(),

  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Le pays ne peut pas dépasser 50 caractères')
    .trim(),

  body('emergency_contact.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le nom du contact d\'urgence ne peut pas dépasser 100 caractères')
    .trim(),

  body('emergency_contact.relationship')
    .optional()
    .isLength({ max: 50 })
    .withMessage('La relation ne peut pas dépasser 50 caractères')
    .trim(),

  body('emergency_contact.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Numéro de téléphone du contact d\'urgence invalide')
    .trim(),

  body('birth_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date de naissance invalide (YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Genre invalide'),

  body('photo_url')
    .optional()
    .isURL()
    .withMessage('URL de photo invalide')
    .trim(),

  body('active')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen')
];
