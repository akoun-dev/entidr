const { CalendarIntegration } = require('../../models');
const { successResponse, errorResponse } = require('../helpers/response');

class CalendarIntegrationController {
  static async create(req, res) {
    try {
      const { provider, credentials, settings } = req.body;

      const integration = await CalendarIntegration.create({
        provider,
        credentials,
        settings,
        createdBy: req.user.id
      });

      return successResponse(res, 201, integration);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async list(req, res) {
    try {
      const integrations = await CalendarIntegration.findAll();
      return successResponse(res, 200, integrations);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async get(req, res) {
    try {
      const integration = await CalendarIntegration.findByPk(req.params.id);

      if (!integration) {
        return errorResponse(res, 404, 'Integration not found');
      }

      return successResponse(res, 200, integration);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const integration = await CalendarIntegration.findByPk(req.params.id);

      if (!integration) {
        return errorResponse(res, 404, 'Integration not found');
      }

      const { provider, credentials, settings } = req.body;
      const updated = await integration.update({
        provider: provider || integration.provider,
        credentials: credentials || integration.credentials,
        settings: settings || integration.settings,
        updatedBy: req.user.id
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const integration = await CalendarIntegration.findByPk(req.params.id);

      if (!integration) {
        return errorResponse(res, 404, 'Integration not found');
      }

      await integration.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = CalendarIntegrationController;
