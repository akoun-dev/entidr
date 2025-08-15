'use strict';

const { Country } = require('../../models');

module.exports = {
    getAllCountries: async (req, res) => {
        try {
            const countries = await Country.findAll();
            res.json(countries);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCountryById: async (req, res) => {
        try {
            const country = await Country.findByPk(req.params.id);
            if (!country) {
                return res.status(404).json({ error: 'Country not found' });
            }
            res.json(country);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createCountry: async (req, res) => {
        try {
            const country = await Country.create(req.body);
            res.status(201).json(country);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    updateCountry: async (req, res) => {
        try {
            const [updated] = await Country.update(req.body, {
                where: { id: req.params.id }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Country not found' });
            }
            const updatedCountry = await Country.findByPk(req.params.id);
            res.json(updatedCountry);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    deleteCountry: async (req, res) => {
        try {
            const deleted = await Country.destroy({
                where: { id: req.params.id }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Country not found' });
            }
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
