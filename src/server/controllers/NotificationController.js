const Notification = require('../../models/notification');
const { successResponse, errorResponse } = require('../helpers/response');
const { Op } = require('sequelize');

class NotificationController {
  static async list(req, res) {
    try {
      const { userId, type, status, channel, page = 1, limit = 20 } = req.query;

      const where = {};
      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (channel) where.channel = channel;

      const notifications = await Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      const total = await Notification.count({ where });

      return successResponse(res, 200, {
        notifications,
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
      const notification = await Notification.findByPk(id);

      if (!notification) {
        return errorResponse(res, 404, 'Notification not found');
      }

      return successResponse(res, 200, notification);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.findByPk(id);

      if (!notification) {
        return errorResponse(res, 404, 'Notification not found');
      }

      const updated = await notification.update({
        status: 'read',
        readAt: new Date()
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = NotificationController;
