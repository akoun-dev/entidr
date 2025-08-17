const AuditLog = require('../../models/auditlog');
const { successResponse, errorResponse } = require('../helpers/response');
const { Op } = require('sequelize');

class AuditLogController {
  static async list(req, res) {
    try {
      const { page = 1, limit = 50, action, targetType, userId, fromDate, toDate } = req.query;

      const where = {};
      if (action) where.action = action;
      if (targetType) where.targetType = targetType;
      if (userId) where.userId = userId;
      if (fromDate || toDate) {
        where.timestamp = {};
        if (fromDate) where.timestamp[Op.gte] = new Date(fromDate);
        if (toDate) where.timestamp[Op.lte] = new Date(toDate);
      }

      const logs = await AuditLog.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      const total = await AuditLog.count({ where });

      return successResponse(res, 200, {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      });
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async get(req, res) {
    try {
      const { id } = req.params;
      const log = await AuditLog.findByPk(id);

      if (!log) {
        return errorResponse(res, 404, 'Audit log not found');
      }

      return successResponse(res, 200, log);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = AuditLogController;
