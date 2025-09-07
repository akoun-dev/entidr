'use strict';

// Schéma minimal pour compatibilité avec le middleware validate()
// Le middleware courant ne vérifie pas réellement le schéma, mais ce fichier
// évite une erreur de module introuvable et prépare une validation future.

const calendarIntegrationSchema = {
  provider: 'string',
  credentials: 'object',
  settings: 'object'
};

module.exports = { calendarIntegrationSchema };

