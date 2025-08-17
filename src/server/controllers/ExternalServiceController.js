const ExternalService = require('../../models/externalService');
const { successResponse, errorResponse } = require('../helpers/response');

class ExternalServiceController {
  static async create(req, res) {
    try {
      const { name, type, config, isActive } = req.body;

      const service = await ExternalService.create({
        name,
        type,
        config,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.id
      });

      return successResponse(res, 201, service);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async list(req, res) {
    try {
      const { type, isActive } = req.query;
      const where = {};

      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;

      const services = await ExternalService.findAll({ where });
      return successResponse(res, 200, services);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async get(req, res) {
    try {
      const service = await ExternalService.findByPk(req.params.id);

      if (!service) {
        return errorResponse(res, 404, 'Service not found');
      }

      return successResponse(res, 200, service);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const service = await ExternalService.findByPk(req.params.id);

      if (!service) {
        return errorResponse(res, 404, 'Service not found');
      }

      const { name, config, isActive } = req.body;
      const updated = await service.update({
        name: name || service.name,
        config: config || service.config,
        isActive: isActive !== undefined ? isActive : service.isActive,
        updatedBy: req.user.id
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const service = await ExternalService.findByPk(req.params.id);

      if (!service) {
        return errorResponse(res, 404, 'Service not found');
      }

      await service.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = ExternalServiceController;
