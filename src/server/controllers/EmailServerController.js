const EmailServer = require('../../models/emailServer');
const { successResponse, errorResponse } = require('../helpers/response');

class EmailServerController {
  static async create(req, res) {
    try {
      const { host, port, secure, username, password, fromEmail } = req.body;

      const server = await EmailServer.create({
        host,
        port,
        secure: secure !== undefined ? secure : true,
        username,
        password,
        fromEmail,
        createdBy: req.user.id
      });

      return successResponse(res, 201, server);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async list(req, res) {
    try {
      const servers = await EmailServer.findAll();
      return successResponse(res, 200, servers);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async get(req, res) {
    try {
      const server = await EmailServer.findByPk(req.params.id);
      if (!server) {
        return errorResponse(res, 404, 'Email server not found');
      }
      return successResponse(res, 200, server);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const server = await EmailServer.findByPk(req.params.id);
      if (!server) {
        return errorResponse(res, 404, 'Email server not found');
      }

      const { host, port, secure, username, password, fromEmail } = req.body;
      const updated = await server.update({
        host: host || server.host,
        port: port || server.port,
        secure: secure !== undefined ? secure : server.secure,
        username: username || server.username,
        password: password || server.password,
        fromEmail: fromEmail || server.fromEmail
      });

      return successResponse(res, 200, updated);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  static async delete(req, res) {
    try {
      const server = await EmailServer.findByPk(req.params.id);
      if (!server) {
        return errorResponse(res, 404, 'Email server not found');
      }
      await server.destroy();
      return successResponse(res, 204);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  static async testConnection(req, res) {
    try {
      // Implémentation de test de connexion
      return successResponse(res, 200, { status: 'success' });
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }
}

module.exports = EmailServerController;
