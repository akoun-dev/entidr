'use strict';

const { Group, User } = require('../../models');
const { validateGroupCreate, validateGroupUpdate } = require('../utils/validators/groupSchemas');

class GroupController {
  static async listGroups(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: groups } = await Group.findAndCountAll({
      include: [{ model: User }],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    const transformedGroups = groups.map(group => ({
      id: group.id.toString(),
      name: group.name,
      description: group.description || '',
      permissions: group.permissions || [],
      active: group.active,
      memberCount: group.Users ? group.Users.length : 0
    }));

    return {
      data: transformedGroups,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  static async getGroup(req, res) {
    const group = await Group.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!group) {
      throw new Error('Groupe non trouvé');
    }

    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description || '',
      permissions: group.permissions || [],
      active: group.active,
      memberCount: group.Users ? group.Users.length : 0
    };
  }

  static async createGroup(req, res) {
    const group = await Group.create({
      name: req.body.name,
      description: req.body.description || '',
      permissions: req.body.permissions || [],
      active: req.body.active !== undefined ? req.body.active : true
    });

    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description || '',
      permissions: group.permissions || [],
      active: group.active,
      memberCount: 0
    };
  }

  static async updateGroup(req, res) {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      throw new Error('Groupe non trouvé');
    }

    if (req.body.name) group.name = req.body.name;
    if (req.body.description !== undefined) group.description = req.body.description;
    if (req.body.permissions) group.permissions = req.body.permissions;
    if (req.body.active !== undefined) group.active = req.body.active;

    await group.save();

    const updatedGroup = await Group.findByPk(group.id, {
      include: [{ model: User }]
    });

    return {
      id: updatedGroup.id.toString(),
      name: updatedGroup.name,
      description: updatedGroup.description || '',
      permissions: updatedGroup.permissions || [],
      active: updatedGroup.active,
      memberCount: updatedGroup.Users ? updatedGroup.Users.length : 0
    };
  }

  static async deleteGroup(req, res) {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      throw new Error('Groupe non trouvé');
    }

    await group.destroy();
    return null;
  }
}

module.exports = GroupController;
