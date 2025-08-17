const DocumentLayout = require('../models/DocumentLayout');
const { NotFoundError } = require('../errors');

class DocumentLayoutController {
  static async create(req, res) {
    try {
      const { name, description, structure, template, isDefault } = req.body;

      const layout = await DocumentLayout.create({
        name,
        description,
        structure,
        template,
        isDefault
      });

      res.status(201).json(layout);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const layouts = await DocumentLayout.findAll();
      res.json(layouts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const layout = await DocumentLayout.findByPk(req.params.id);
      if (!layout) {
        throw new NotFoundError('Mise en page non trouvée');
      }
      res.json(layout);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const layout = await DocumentLayout.findByPk(req.params.id);
      if (!layout) {
        throw new NotFoundError('Mise en page non trouvée');
      }

      const { name, description, structure, template, isDefault } = req.body;

      await layout.update({
        name,
        description,
        structure,
        template,
        isDefault
      });

      res.json(layout);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const layout = await DocumentLayout.findByPk(req.params.id);
      if (!layout) {
        throw new NotFoundError('Mise en page non trouvée');
      }

      await layout.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async setAsDefault(req, res) {
    try {
      const layout = await DocumentLayout.findByPk(req.params.id);
      if (!layout) {
        throw new NotFoundError('Mise en page non trouvée');
      }

      // Désactive toutes les autres mises en page par défaut
      await DocumentLayout.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );

      // Définit la mise en page courante comme défaut
      await layout.update({ isDefault: true });

      res.json(layout);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = DocumentLayoutController;
