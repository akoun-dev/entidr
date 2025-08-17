const BusinessProcess = require('../models/BusinessProcess');
const { NotFoundError } = require('../errors');

class BusinessProcessController {
  static async create(req, res) {
    try {
      const { name, description, steps, roles, version } = req.body;

      const process = await BusinessProcess.create({
        name,
        description,
        steps,
        roles,
        version
      });

      res.status(201).json(process);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const processes = await BusinessProcess.findAll();
      res.json(processes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async get(req, res) {
    try {
      const process = await BusinessProcess.findByPk(req.params.id);
      if (!process) {
        throw new NotFoundError('Processus métier non trouvé');
      }
      res.json(process);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const process = await BusinessProcess.findByPk(req.params.id);
      if (!process) {
        throw new NotFoundError('Processus métier non trouvé');
      }

      const { name, description, steps, roles, version } = req.body;

      await process.update({
        name,
        description,
        steps,
        roles,
        version
      });

      res.json(process);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const process = await BusinessProcess.findByPk(req.params.id);
      if (!process) {
        throw new NotFoundError('Processus métier non trouvé');
      }

      await process.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  static async execute(req, res) {
    try {
      const process = await BusinessProcess.findByPk(req.params.id);
      if (!process) {
        throw new NotFoundError('Processus métier non trouvé');
      }

      // Simulation d'exécution du processus
      const executionResult = {
        processId: process.id,
        startedAt: new Date().toISOString(),
        steps: process.steps.map((step, index) => ({
          stepId: index + 1,
          name: step.name,
          type: step.type || 'task',
          status: 'completed',
          duration: Math.floor(Math.random() * 1000) + 'ms',
          result: `Résultat simulé pour ${step.name}`,
          logs: [`Log d'exécution pour ${step.name}`]
        })),
        completedAt: new Date().toISOString(),
        status: 'completed',
        duration: Math.floor(Math.random() * 5000) + 'ms',
        output: {
          type: process.outputType || 'default',
          data: `Données de sortie simulées pour ${process.name}`
        }
      };

      res.json({
        success: true,
        message: 'Processus exécuté avec succès',
        process: {
          id: process.id,
          name: process.name,
          version: process.version
        },
        executionId: 'exec-' + Date.now(),
        executionResult,
        nextSteps: process.nextSteps || [],
        warning: 'Ceci est une simulation - implémentez la logique réelle ici'
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = BusinessProcessController;
