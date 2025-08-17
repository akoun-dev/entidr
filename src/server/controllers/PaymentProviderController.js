const PaymentProvider = require('../../models/paymentProvider');
const { successResponse, errorResponse } = require('../helpers/response');

class PaymentProviderController {
  static async create(req, res) {
    try {
      const { name, type, config, isActive } = req.body;

      const provider = await PaymentProvider.create({
        name,
        type,
        config,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.id
      });

      return successResponse(res, 201, provider);
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

      const providers = await PaymentProvider.findAll({ where });
      return successResponse(res, 200, providers);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async get(req, res) {
    try {
      const provider = await PaymentProvider.findByPk(req.params.id);

      if (!provider) {
        return errorResponse(res, 404, 'Payment provider not found');
      }

      return successResponse(res, 200, provider);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const provider = await PaymentProvider.findByPk(req.params.id);

      if (!provider) {
        return errorResponse(res, 404, 'Payment provider not found');
      }

      const { name, config, isActive } = req.body;
      const updated = await provider.update({
        name: name || provider.name,
        config: config || provider.config,
        isActive: isActive !== undefined ? isActive : provider.isActive,
        updatedBy: req.user.id
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const provider = await PaymentProvider.findByPk(req.params.id);

      if (!provider) {
        return errorResponse(res, 404, 'Payment provider not found');
      }

      await provider.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = PaymentProviderController;
