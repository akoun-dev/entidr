const NotificationChannel = require('../../models/notificationchannel');
const { successResponse, errorResponse } = require('../helpers/response');

class NotificationChannelController {
  static async list(req, res) {
    try {
      const channels = await NotificationChannel.findAll({
        order: [['displayOrder', 'ASC']]
      });
      return successResponse(res, 200, channels);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async create(req, res) {
    try {
      const { name, type, description, config, enabled, displayOrder, icon } = req.body;

      const channel = await NotificationChannel.create({
        name,
        type,
        description,
        config,
        enabled: enabled !== undefined ? enabled : true,
        displayOrder: displayOrder || 0,
        icon
      });

      return successResponse(res, 201, channel);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, config, enabled, displayOrder, icon } = req.body;

      const channel = await NotificationChannel.findByPk(id);
      if (!channel) {
        return errorResponse(res, 404, 'Notification channel not found');
      }

      const updated = await channel.update({
        name: name || channel.name,
        description: description || channel.description,
        config: config || channel.config,
        enabled: enabled !== undefined ? enabled : channel.enabled,
        displayOrder: displayOrder || channel.displayOrder,
        icon: icon || channel.icon
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const channel = await NotificationChannel.findByPk(id);

      if (!channel) {
        return errorResponse(res, 404, 'Notification channel not found');
      }

      await channel.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = NotificationChannelController;
