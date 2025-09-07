'use strict';

const { ReportTemplate } = require('../../models');

module.exports = {
    getAllReportTemplates: async (req, res) => {
        try {
            const templates = await ReportTemplate.findAll();
            res.ok(templates);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getReportTemplateById: async (req, res) => {
        try {
            const template = await ReportTemplate.findByPk(req.params.id);
            if (!template) {
                return res.fail(404, 'Report template not found');
            }
            res.ok(template);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createReportTemplate: async (req, res) => {
        try {
            const template = await ReportTemplate.create(req.body);
            res.ok(template, 201);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    updateReportTemplate: async (req, res) => {
        try {
            const [updated] = await ReportTemplate.update(req.body, {
                where: { id: req.params.id }
            });
            if (!updated) {
                return res.fail(404, 'Report template not found');
            }
            const updatedTemplate = await ReportTemplate.findByPk(req.params.id);
            res.ok(updatedTemplate);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    deleteReportTemplate: async (req, res) => {
        try {
            const deleted = await ReportTemplate.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) {
                return res.fail(404, 'Report template not found');
            }
            res.ok(null, 204);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
