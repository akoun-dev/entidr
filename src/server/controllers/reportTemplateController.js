'use strict';

const { ReportTemplate } = require('../../models');

module.exports = {
    getAllReportTemplates: async (req, res) => {
        try {
            const templates = await ReportTemplate.findAll();
            res.json(templates);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getReportTemplateById: async (req, res) => {
        try {
            const template = await ReportTemplate.findByPk(req.params.id);
            if (!template) {
                return res.status(404).json({ error: 'Report template not found' });
            }
            res.json(template);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createReportTemplate: async (req, res) => {
        try {
            const template = await ReportTemplate.create(req.body);
            res.status(201).json(template);
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
                return res.status(404).json({ error: 'Report template not found' });
            }
            const updatedTemplate = await ReportTemplate.findByPk(req.params.id);
            res.json(updatedTemplate);
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
                return res.status(404).json({ error: 'Report template not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
