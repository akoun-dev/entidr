const { SecuritySetting } = require('../../models');
const { successResponse, errorResponse } = require('../helpers/response');

class SecuritySettingController {
  static async get(req, res) {
    try {
      const settings = await SecuritySetting.findAll();
      return successResponse(res, 200, settings);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const { value, description, valueType, category } = req.body;
      const key = req.params.key || req.body.key;

      const [setting, created] = await SecuritySetting.upsert({
        key,
        value,
        description: description || null,
        valueType: valueType || 'string',
        category: category || 'general'
      }, {
        returning: true
      });

      return successResponse(res, created ? 201 : 200, setting);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getByKey(req, res) {
    try {
      const { key } = req.params;
      const setting = await SecuritySetting.findOne({ where: { key } });

      if (!setting) {
        return errorResponse(res, 404, 'Security setting not found');
      }

      return successResponse(res, 200, setting);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const settings = await SecuritySetting.findAll({ where: { category } });
      return successResponse(res, 200, settings);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await SecuritySetting.findAll({
        attributes: ['category'],
        group: ['category']
      });
      return successResponse(res, 200, categories.map(c => c.category));
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const { key } = req.params;
      const setting = await SecuritySetting.findOne({ where: { key } });

      if (!setting) {
        return errorResponse(res, 404, 'Security setting not found');
      }

      await setting.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = SecuritySettingController;
