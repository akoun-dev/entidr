'use strict';

const { DocumentLayout } = require('../../models');

module.exports = {
    getAllDocumentLayouts: async (req, res) => {
        try {
            const layouts = await DocumentLayout.findAll();
            res.json(layouts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getDocumentLayoutById: async (req, res) => {
        try {
            const layout = await DocumentLayout.findByPk(req.params.id);
            if (!layout) {
                return res.status(404).json({ error: 'Document layout not found' });
            }
            res.json(layout);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createDocumentLayout: async (req, res) => {
        try {
            const layout = await DocumentLayout.create(req.body);
            res.status(201).json(layout);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    updateDocumentLayout: async (req, res) => {
        try {
            const [updated] = await DocumentLayout.update(req.body, {
                where: { id: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Document layout not found' });
            }
            const updatedLayout = await DocumentLayout.findByPk(req.params.id);
            res.json(updatedLayout);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    deleteDocumentLayout: async (req, res) => {
        try {
            const deleted = await DocumentLayout.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Document layout not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
