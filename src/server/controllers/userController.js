'use strict';

const { User } = require('../../models');

class UserController {
  static async listUsers(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    const transformedUsers = users.map(user => ({
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      active: user.active,
      lastLogin: user.lastLogin
    }));

    return {
      data: transformedUsers,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  static async getUser(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      active: user.active,
      lastLogin: user.lastLogin
    };
  }

  static async createUser(req, res) {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      active: req.body.active !== undefined ? req.body.active : true
    });

    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      active: user.active
    };
  }

  static async updateUser(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.active !== undefined) user.active = req.body.active;

    await user.save();

    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      active: user.active
    };
  }

  static async deleteUser(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    await user.destroy();
    return null;
  }
}

module.exports = UserController;
