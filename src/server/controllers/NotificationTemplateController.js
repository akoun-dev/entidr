const NotificationTemplate = require('../../models/notificationtemplate');
const { successResponse, errorResponse } = require('../helpers/response');

class NotificationTemplateController {
  static async create(req, res) {
    try {
      const { name, subject, content, type, variables } = req.body;

      const template = await NotificationTemplate.create({
        name,
        subject,
        content,
        type,
        variables,
        createdBy: req.user.id
      });

      return successResponse(res, 201, template);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async list(req, res) {
    try {
      const { type } = req.query;
      const where = {};

      if (type) where.type = type;

      const templates = await NotificationTemplate.findAll({ where });
      return successResponse(res, 200, templates);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async get(req, res) {
    try {
      const template = await NotificationTemplate.findByPk(req.params.id);

      if (!template) {
        return errorResponse(res, 404, 'Template not found');
      }

      return successResponse(res, 200, template);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const template = await NotificationTemplate.findByPk(req.params.id);

      if (!template) {
        return errorResponse(res, 404, 'Template not found');
      }

      const { name, subject, content, variables } = req.body;
      const updated = await template.update({
        name: name || template.name,
        subject: subject || template.subject,
        content: content || template.content,
        variables: variables || template.variables,
        updatedBy: req.user.id
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const template = await NotificationTemplate.findByPk(req.params.id);

      if (!template) {
        return errorResponse(res, 404, 'Template not found');
      }

      await template.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = NotificationTemplateController;
