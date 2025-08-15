'use strict';

const { Currency } = require('../../models');

module.exports = {
    getAllCurrencies: async (req, res) => {
        try {
            const currencies = await Currency.findAll();
            res.json(currencies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCurrencyById: async (req, res) => {
        try {
            const currency = await Currency.findByPk(req.params.id);
            if (!currency) {
                return res.status(404).json({ error: 'Currency not found' });
            }
            res.json(currency);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createCurrency: async (req, res) => {
        try {
            const currency = await Currency.create(req.body);
            res.status(201).json(currency);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    updateCurrency: async (req, res) => {
        try {
            const [updated] = await Currency.update(req.body, {
                where: { id: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Currency not found' });
            }
            const updatedCurrency = await Currency.findByPk(req.params.id);
            res.json(updatedCurrency);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    deleteCurrency: async (req, res) => {
        try {
            const deleted = await Currency.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Currency not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
