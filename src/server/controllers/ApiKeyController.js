const ApiKey = require('../../models/apikey');
const { maskKey } = require('../../models/apikey');
const { successResponse, errorResponse } = require('../helpers/response');

class ApiKeyController {
  static async list(req, res) {
    try {
      const apiKeys = await ApiKey.findAll();
      return successResponse(res, 200, apiKeys);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async create(req, res) {
    try {
      const { name, permissions, description } = req.body;
      const apiKey = await ApiKey.create({
        name,
        permissions,
        description
      });

      // Return masked key for security
      const response = {
        ...apiKey.get({ plain: true }),
        key: maskKey(apiKey.key)
      };

      return successResponse(res, 201, response);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async get(req, res) {
    try {
      const { id } = req.params;
      const apiKey = await ApiKey.findByPk(id);

      if (!apiKey) {
        return errorResponse(res, 404, 'API Key not found');
      }

      // Return masked key
      const response = {
        ...apiKey.get({ plain: true }),
        key: maskKey(apiKey.key)
      };

      return successResponse(res, 200, response);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, permissions, description, active } = req.body;

      const apiKey = await ApiKey.findByPk(id);
      if (!apiKey) {
        return errorResponse(res, 404, 'API Key not found');
      }

      await apiKey.update({
        name: name || apiKey.name,
        permissions: permissions || apiKey.permissions,
        description: description || apiKey.description,
        active: active !== undefined ? active : apiKey.active
      });

      return successResponse(res, 200, apiKey);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const apiKey = await ApiKey.findByPk(id);

      if (!apiKey) {
        return errorResponse(res, 404, 'API Key not found');
      }

      await apiKey.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = ApiKeyController;
