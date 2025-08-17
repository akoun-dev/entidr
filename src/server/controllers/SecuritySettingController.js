const SecuritySetting = require('../../models/securitysetting');
const { successResponse, errorResponse } = require('../helpers/response');

class SecuritySettingController {
  static async list(req, res) {
    try {
      const settings = await SecuritySetting.findAll();
      return successResponse(res, 200, settings);
    } catch (error) {
      return errorResponse(res, 500, error.message);
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

  static async update(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      const setting = await SecuritySetting.findOne({ where: { key } });
      if (!setting) {
        return errorResponse(res, 404, 'Security setting not found');
      }

      const updatedSetting = await setting.update({ value });
      return successResponse(res, 200, updatedSetting);
    } catch (error) {
      return errorResponse(res, 400, error.message);
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
}

module.exports = SecuritySettingController;
