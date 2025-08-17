const ImportConfig = require('../models/ImportConfig');
const { NotFoundError } = require('../errors');

class ImportConfigController {
  static async create(req, res) {
    try {
      const { sourceType, sourceConfig, mapping, schedule, isActive } = req.body;

      const config = await ImportConfig.create({
        sourceType,
        sourceConfig,
        mapping,
        schedule,
        isActive
      });

      res.status(201).json(config);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const configs = await ImportConfig.findAll();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const config = await ImportConfig.findByPk(req.params.id);
      if (!config) {
        throw new NotFoundError('Configuration d\'import non trouvée');
      }
      res.json(config);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const config = await ImportConfig.findByPk(req.params.id);
      if (!config) {
        throw new NotFoundError('Configuration d\'import non trouvée');
      }

      const { sourceType, sourceConfig, mapping, schedule, isActive } = req.body;

      await config.update({
        sourceType,
        sourceConfig,
        mapping,
        schedule,
        isActive
      });

      res.json(config);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const config = await ImportConfig.findByPk(req.params.id);
      if (!config) {
        throw new NotFoundError('Configuration d\'import non trouvée');
      }

      await config.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async testImport(req, res) {
    try {
      const config = await ImportConfig.findByPk(req.params.id);
      if (!config) {
        throw new NotFoundError('Configuration d\'import non trouvée');
      }

      // Simulation d'import basée sur la configuration
      const testResult = {
        sourceType: config.sourceType,
        sampleData: {
          id: 'test-' + Date.now(),
          content: 'Donnée de test importée',
          timestamp: new Date().toISOString()
        },
        mapping: config.mapping,
        status: 'success'
      };

      // Logique conditionnelle selon le type de source
      switch(config.sourceType) {
        case 'API':
          testResult.apiDetails = {
            endpoint: config.sourceConfig.endpoint,
            method: config.sourceConfig.method || 'GET',
            headers: config.sourceConfig.headers || {}
          };
          break;
        case 'Database':
          testResult.queryDetails = {
            query: `SELECT * FROM ${config.sourceConfig.table} LIMIT 1`,
            connection: config.sourceConfig.connection
          };
          break;
        case 'File':
          testResult.fileDetails = {
            path: '/temp/import_sample.txt',
            format: config.sourceConfig.format,
            sampleContent: JSON.stringify(testResult.sampleData)
          };
          break;
      }

      res.json({
        success: true,
        message: 'Test d\'import simulé avec succès',
        configId: config.id,
        testResult,
        warning: 'Ceci est une simulation - implémentez la logique réelle ici'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = ImportConfigController;
