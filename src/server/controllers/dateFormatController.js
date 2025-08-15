'use strict';

const { DateFormat } = require('../../models');

module.exports = {
    getAllDateFormats: async (req, res) => {
        try {
            const formats = await DateFormat.findAll();
            res.json(formats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getDateFormatById: async (req, res) => {
        try {
            const format = await DateFormat.findByPk(req.params.id);
            if (!format) {
                return res.status(404).json({ error: 'Date format not found' });
            }
            res.json(format);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createDateFormat: async (req, res) => {
        try {
            const format = await DateFormat.create(req.body);
            res.status(201).json(format);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    updateDateFormat: async (req, res) => {
        try {
            const [updated] = await DateFormat.update(req.body, {
                where: { id: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Date format not found' });
            }
            const updatedFormat = await DateFormat.findByPk(req.params.id);
            res.json(updatedFormat);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    deleteDateFormat: async (req, res) => {
        try {
            const deleted = await DateFormat.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Date format not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
