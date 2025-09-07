'use strict';

const { DocumentLayout } = require('../../models');

module.exports = {
    getAllDocumentLayouts: async (req, res) => {
        try {
            const layouts = await DocumentLayout.findAll();
            res.ok(layouts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getDocumentLayoutById: async (req, res) => {
        try {
            const layout = await DocumentLayout.findByPk(req.params.id);
            if (!layout) {
                return res.fail(404, 'Document layout not found');
            }
            res.ok(layout);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createDocumentLayout: async (req, res) => {
        try {
            const layout = await DocumentLayout.create(req.body);
            res.ok(layout, 201);
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
                return res.fail(404, 'Document layout not found');
            }
            const updatedLayout = await DocumentLayout.findByPk(req.params.id);
            res.ok(updatedLayout);
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
                return res.fail(404, 'Document layout not found');
            }
            res.ok(null, 204);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    ,

    // Définir un modèle comme par défaut pour son type
    setDefault: async (req, res) => {
        try {
            const layout = await DocumentLayout.findByPk(req.params.id);
            if (!layout) {
                return res.fail(404, 'Document layout not found');
            }
            layout.isDefault = true;
            await layout.save();
            res.ok(layout);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};
