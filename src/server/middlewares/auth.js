const { User } = require('../../models');

// Middleware d'authentification basique
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    // Vérification basique du token (dans un vrai projet, utiliser JWT)
    // Pour le moment, on accepte n'importe quel token pour le développement
    req.user = { id: 1, role: 'admin' }; // Utilisateur par défaut pour le développement

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token d\'authentification invalide'
    });
  }
};

// Middleware d'autorisation
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
