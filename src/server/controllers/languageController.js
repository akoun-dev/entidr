'use strict';

const { Language } = require('../../models');
const { Op } = require('sequelize');

const languageController = {
  async getAllLanguages(req, res) {
    try {
      const languages = await Language.findAll();
      return res.status(200).json(languages);
    } catch (error) {
      console.error('Erreur lors de la récupération des langues:', error);
      return res.status(500).json({
        message: "Une erreur est survenue lors de la récupération des langues",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async getLanguageById(req, res) {
    try {
      const language = await Language.findByPk(req.params.id);
      if (!language) {
        return res.status(404).json({
          message: 'Langue non trouvée'
        });
      }
      return res.status(200).json(language);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la langue ${req.params.id}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de la récupération de la langue ${req.params.id}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async createLanguage(req, res) {
    try {
      const language = await Language.create(req.body);
      return res.status(201).json(language);
    } catch (error) {
      console.error('Erreur lors de la création de la langue:', error);
      return res.status(400).json({
        message: "Impossible de créer la langue",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async updateLanguage(req, res) {
    try {
      const [updated] = await Language.update(req.body, {
        where: { id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({
          message: 'Langue non trouvée'
        });
      }
      const updatedLanguage = await Language.findByPk(req.params.id);
      return res.status(200).json(updatedLanguage);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la langue ${req.params.id}:`, error);
      return res.status(400).json({
        message: `Une erreur est survenue lors de la mise à jour de la langue ${req.params.id}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async deleteLanguage(req, res) {
    try {
      const deleted = await Language.destroy({
        where: { id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({
          message: 'Langue non trouvée'
        });
      }
      return res.status(204).end();
    } catch (error) {
      console.error(`Erreur lors de la suppression de la langue ${req.params.id}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de la suppression de la langue ${req.params.id}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async toggleStatus(req, res) {
    try {
      const language = await Language.findByPk(req.params.id);
      if (!language) {
        return res.status(404).json({
          message: 'Langue non trouvée'
        });
      }
      language.active = !language.active;
      await language.save();
      return res.status(200).json(language);
    } catch (error) {
      console.error(`Erreur lors du changement de statut de la langue ${req.params.id}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors du changement de statut de la langue ${req.params.id}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  async setDefault(req, res) {
    try {
      const language = await Language.findByPk(req.params.id);
      if (!language) {
        return res.status(404).json({
          message: 'Langue non trouvée'
        });
      }
      await Language.update({ is_default: false }, {
        where: { id: { [Op.ne]: language.id } }
      });
      language.is_default = true;
      await language.save();
      return res.status(200).json(language);
    } catch (error) {
      console.error(`Erreur lors de la définition de la langue par défaut ${req.params.id}:`, error);
      return res.status(500).json({
        message: `Une erreur est survenue lors de la définition de la langue par défaut ${req.params.id}`,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = languageController;
