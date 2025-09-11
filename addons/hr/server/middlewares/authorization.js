'use strict';

module.exports = function createAuthorize(sequelizeModels) {
  const { HrEmployeeRole, HrRole } = sequelizeModels;

  function normalizePerms(role) {
    const p = Array.isArray(role?.permissions) ? role.permissions : [];
    return p.filter(Boolean).map(String);
  }

  return function authorize(resource, action) {
    return async function (req, res, next) {
      try {
        const userId = req.user?.id;
        if (!userId) return res.fail(401, 'Utilisateur non authentifié');

        const rows = await HrEmployeeRole.findAll({
          where: { employee_id: userId },
          include: [{ model: HrRole, as: 'role' }]
        });
        const perms = rows.reduce((set, r) => {
          for (const p of normalizePerms(r.role)) set.add(p);
          return set;
        }, new Set());

        const needed = [`${resource}:${action}`, `${resource}:*`, '*'];
        const ok = needed.some(k => perms.has(k));
        if (!ok) return res.fail(403, 'Permissions insuffisantes');
        next();
      } catch (e) {
        console.error('[HR authorize] error', e?.message || e);
        return res.fail(500, 'Erreur lors de la vérification des permissions');
      }
    };
  };
};

