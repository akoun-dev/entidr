const LoggingSetting = require('../../models/loggingsetting');
const { successResponse, errorResponse } = require('../helpers/response');

class LoggingSettingController {
  static async list(req, res) {
    try {
      const settings = await LoggingSetting.findAll();
      return successResponse(res, 200, settings);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async getByKey(req, res) {
    try {
      const { key } = req.params;
      const setting = await LoggingSetting.findOne({ where: { key } });

      if (!setting) {
        return errorResponse(res, 404, 'Logging setting not found');
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

      const setting = await LoggingSetting.findOne({ where: { key } });
      if (!setting) {
        return errorResponse(res, 404, 'Logging setting not found');
      }

      const updatedSetting = await setting.update({ value });
      return successResponse(res, 200, updatedSetting);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async getCategories(req, res) {
    try {
      const categories = await LoggingSetting.findAll({
        attributes: ['category'],
        group: ['category']
      });
      return successResponse(res, 200, categories.map(c => c.category));
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = LoggingSettingController;
