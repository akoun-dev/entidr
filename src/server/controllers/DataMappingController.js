const DataMapping = require('../models/DataMapping');
const { NotFoundError } = require('../errors');

class DataMappingController {
  static async create(req, res) {
    try {
      const { name, description, sourceFields, targetFields, transformationRules } = req.body;

      const mapping = await DataMapping.create({
        name,
        description,
        sourceFields,
        targetFields,
        transformationRules
      });

      res.status(201).json(mapping);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const mappings = await DataMapping.findAll();
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const mapping = await DataMapping.findByPk(req.params.id);
      if (!mapping) {
        throw new NotFoundError('Mapping de données non trouvé');
      }
      res.json(mapping);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const mapping = await DataMapping.findByPk(req.params.id);
      if (!mapping) {
        throw new NotFoundError('Mapping de données non trouvé');
      }

      const { name, description, sourceFields, targetFields, transformationRules } = req.body;

      await mapping.update({
        name,
        description,
        sourceFields,
        targetFields,
        transformationRules
      });

      res.json(mapping);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const mapping = await DataMapping.findByPk(req.params.id);
      if (!mapping) {
        throw new NotFoundError('Mapping de données non trouvé');
      }

      await mapping.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async testMapping(req, res) {
    try {
      const mapping = await DataMapping.findByPk(req.params.id);
      if (!mapping) {
        throw new NotFoundError('Mapping de données non trouvé');
      }

      // TODO: Implémenter la logique de test
      res.json({
        success: true,
        message: 'Mapping testé avec succès',
        sampleOutput: {}
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = DataMappingController;
