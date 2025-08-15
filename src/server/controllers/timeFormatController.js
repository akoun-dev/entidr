'use strict';

const { TimeFormat } = require('../../models');

module.exports = {
    getAllTimeFormats: async (req, res) => {
        try {
            const formats = await TimeFormat.findAll();
            res.json(formats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getTimeFormatById: async (req, res) => {
        try {
            const format = await TimeFormat.findByPk(req.params.id);
            if (!format) {
                return res.status(404).json({ error: 'Time format not found' });
            }
            res.json(format);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createTimeFormat: async (req, res) => {
        try {
            const format = await TimeFormat.create(req.body);
            res.status(201).json(format);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    updateTimeFormat: async (req, res) => {
        try {
            const [updated] = await TimeFormat.update(req.body, {
                where: { id: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Time format not found' });
            }
            const updatedFormat = await TimeFormat.findByPk(req.params.id);
            res.json(updatedFormat);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    deleteTimeFormat: async (req, res) => {
        try {
            const deleted = await TimeFormat.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Time format not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
