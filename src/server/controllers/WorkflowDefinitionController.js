const WorkflowDefinition = require('../models/WorkflowDefinition');
const { NotFoundError } = require('../errors');

class WorkflowDefinitionController {
  static async create(req, res) {
    try {
      const { name, description, steps, triggers, isActive } = req.body;

      const workflow = await WorkflowDefinition.create({
        name,
        description,
        steps,
        triggers,
        isActive
      });

      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const workflows = await WorkflowDefinition.findAll();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const workflow = await WorkflowDefinition.findByPk(req.params.id);
      if (!workflow) {
        throw new NotFoundError('Définition de workflow non trouvée');
      }
      res.json(workflow);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const workflow = await WorkflowDefinition.findByPk(req.params.id);
      if (!workflow) {
        throw new NotFoundError('Définition de workflow non trouvée');
      }

      const { name, description, steps, triggers, isActive } = req.body;

      await workflow.update({
        name,
        description,
        steps,
        triggers,
        isActive
      });

      res.json(workflow);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const workflow = await WorkflowDefinition.findByPk(req.params.id);
      if (!workflow) {
        throw new NotFoundError('Définition de workflow non trouvée');
      }

      await workflow.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async testWorkflow(req, res) {
    try {
      const workflow = await WorkflowDefinition.findByPk(req.params.id);
      if (!workflow) {
        throw new NotFoundError('Définition de workflow non trouvée');
      }

      // TODO: Implémenter la logique de test
      res.json({
        success: true,
        message: 'Workflow testé avec succès',
        executionId: 'test-' + Date.now()
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = WorkflowDefinitionController;
