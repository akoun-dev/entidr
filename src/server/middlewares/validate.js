const validate = (schema) => {
  return (req, res, next) => {
    // Validation basique pour le développement
    // Dans un vrai projet, utiliser express-validator ou joi
    next();
  };
};

module.exports = {
  validate
};
