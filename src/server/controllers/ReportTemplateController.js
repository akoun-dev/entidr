const ReportTemplate = require('../models/ReportTemplate');
const { NotFoundError } = require('../errors');

class ReportTemplateController {
  static async create(req, res) {
    try {
      const { name, description, template, parameters, outputFormat } = req.body;

      const reportTemplate = await ReportTemplate.create({
        name,
        description,
        template,
        parameters,
        outputFormat
      });

      res.status(201).json(reportTemplate);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const templates = await ReportTemplate.findAll();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const template = await ReportTemplate.findByPk(req.params.id);
      if (!template) {
        throw new NotFoundError('Modèle de rapport non trouvé');
      }
      res.json(template);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const template = await ReportTemplate.findByPk(req.params.id);
      if (!template) {
        throw new NotFoundError('Modèle de rapport non trouvé');
      }

      const { name, description, template: templateContent, parameters, outputFormat } = req.body;

      await template.update({
        name,
        description,
        template: templateContent,
        parameters,
        outputFormat
      });

      res.json(template);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const template = await ReportTemplate.findByPk(req.params.id);
      if (!template) {
        throw new NotFoundError('Modèle de rapport non trouvé');
      }

      await template.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async generateReport(req, res) {
    try {
      const template = await ReportTemplate.findByPk(req.params.id);
      if (!template) {
        throw new NotFoundError('Modèle de rapport non trouvé');
      }

      // Simulation de génération de rapport
      const reportData = {
        templateId: template.id,
        generatedAt: new Date().toISOString(),
        parameters: req.body.parameters || {},
        status: 'completed'
      };

      // Génération selon le format de sortie
      let reportContent;
      switch(template.outputFormat) {
        case 'PDF':
          reportContent = {
            format: 'PDF',
            size: 'A4',
            pages: 10,
            content: `PDF simulé pour le modèle ${template.name}`
          };
          break;
        case 'Excel':
          reportContent = {
            format: 'Excel',
            sheets: 1,
            rows: 100,
            content: `Fichier Excel simulé pour le modèle ${template.name}`
          };
          break;
        case 'HTML':
          reportContent = {
            format: 'HTML',
            content: `<html><body><h1>Rapport ${template.name}</h1></body></html>`
          };
          break;
        default:
          reportContent = {
            format: 'RAW',
            content: template.template
          };
      }

      res.json({
        success: true,
        message: 'Rapport généré avec succès',
        template: template.name,
        reportId: `report-${Date.now()}`,
        downloadUrl: `/api/report-templates/${req.params.id}/download`,
        reportData,
        reportContent,
        warning: 'Ceci est une simulation - implémentez la logique réelle ici'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = ReportTemplateController;
