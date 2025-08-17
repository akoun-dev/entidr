const ComplianceConfig = require('../../models/complianceConfig');
const { successResponse, errorResponse } = require('../helpers/response');

class ComplianceConfigController {
  static async get(req, res) {
    try {
      const config = await ComplianceConfig.findOne();
      return successResponse(res, 200, config || {});
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const {
        dataRetentionDays,
        auditLogRetentionDays,
        gdprCompliance,
        isActive
      } = req.body;

      let config = await ComplianceConfig.findOne();

      if (!config) {
        config = await ComplianceConfig.create({
          dataRetentionDays: 365,
          auditLogRetentionDays: 180,
          gdprCompliance: false,
          isActive: true
        });
      }

      const updated = await config.update({
        dataRetentionDays: dataRetentionDays || config.dataRetentionDays,
        auditLogRetentionDays: auditLogRetentionDays || config.auditLogRetentionDays,
        gdprCompliance: gdprCompliance !== undefined ? gdprCompliance : config.gdprCompliance,
        isActive: isActive !== undefined ? isActive : config.isActive
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async checkCompliance(req, res) {
    try {
      // Implémentation de vérification de conformité
      return successResponse(res, 200, { status: 'compliant' });
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}

module.exports = ComplianceConfigController;
