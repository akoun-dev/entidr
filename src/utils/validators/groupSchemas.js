// Validation manuelle en attendant de résoudre les problèmes d'installation
const validateGroupCreate = (data) => {
  const errors = [];

  if (!data.name || data.name.length < 3 || data.name.length > 50) {
    errors.push('Le nom doit contenir entre 3 et 50 caractères');
  }

  if (data.description && data.description.length > 200) {
    errors.push('La description ne doit pas dépasser 200 caractères');
  }

  if (data.permissions && !Array.isArray(data.permissions)) {
    errors.push('Les permissions doivent être un tableau');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateGroupUpdate = (data) => {
  const errors = [];
  const hasUpdates = Object.keys(data).length > 0;

  if (!hasUpdates) {
    errors.push('Au moins un champ doit être fourni pour la mise à jour');
  }

  if (data.name && (data.name.length < 3 || data.name.length > 50)) {
    errors.push('Le nom doit contenir entre 3 et 50 caractères');
  }

  if (data.description && data.description.length > 200) {
    errors.push('La description ne doit pas dépasser 200 caractères');
  }

  if (data.permissions && !Array.isArray(data.permissions)) {
    errors.push('Les permissions doivent être un tableau');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateGroupCreate,
  validateGroupUpdate
};
