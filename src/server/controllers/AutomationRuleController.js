const AutomationRule = require('../models/AutomationRule');
const { NotFoundError } = require('../errors');

class AutomationRuleController {
  static async create(req, res) {
    try {
      const { name, description, trigger, conditions, actions, isActive } = req.body;

      const rule = await AutomationRule.create({
        name,
        description,
        trigger,
        conditions,
        actions,
        isActive
      });

      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const rules = await AutomationRule.findAll();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const rule = await AutomationRule.findByPk(req.params.id);
      if (!rule) {
        throw new NotFoundError('Règle d\'automatisation non trouvée');
      }
      res.json(rule);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const rule = await AutomationRule.findByPk(req.params.id);
      if (!rule) {
        throw new NotFoundError('Règle d\'automatisation non trouvée');
      }

      const { name, description, trigger, conditions, actions, isActive } = req.body;

      await rule.update({
        name,
        description,
        trigger,
        conditions,
        actions,
        isActive
      });

      res.json(rule);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const rule = await AutomationRule.findByPk(req.params.id);
      if (!rule) {
        throw new NotFoundError('Règle d\'automatisation non trouvée');
      }

      await rule.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async testRule(req, res) {
    try {
      const rule = await AutomationRule.findByPk(req.params.id);
      if (!rule) {
        throw new NotFoundError('Règle d\'automatisation non trouvée');
      }

      // TODO: Implémenter la logique de test
      res.json({ success: true, message: 'Test de règle réussi' });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = AutomationRuleController;
