'use strict';

const express = require('express');
const { Group, User } = require('../../models');

const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes for groups
router.get('/', asyncHandler(async (req, res) => {
  const groups = await Group.findAll({
    include: [{ model: User }]
  });

  const transformedGroups = groups.map(group => ({
    id: group.id.toString(),
    name: group.name,
    description: group.description || '',
    permissions: group.permissions || [],
    active: group.active,
    memberCount: group.Users ? group.Users.length : 0
  }));

  res.json(transformedGroups);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id, {
    include: [{ model: User }]
  });

  if (!group) {
    return res.status(404).json({ message: 'Groupe non trouvé' });
  }

  const transformedGroup = {
    id: group.id.toString(),
    name: group.name,
    description: group.description || '',
    permissions: group.permissions || [],
    active: group.active,
    memberCount: group.Users ? group.Users.length : 0
  };

  res.json(transformedGroup);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, description, permissions, active } = req.body;

  const group = await Group.create({
    name,
    description,
    permissions: permissions || [],
    active: active !== undefined ? active : true
  });

  const transformedGroup = {
    id: group.id.toString(),
    name: group.name,
    description: group.description || '',
    permissions: group.permissions || [],
    active: group.active,
    memberCount: 0
  };

  res.status(201).json(transformedGroup);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { name, description, permissions, active } = req.body;

  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Groupe non trouvé' });
  }

  if (name) group.name = name;
  if (description !== undefined) group.description = description;
  if (permissions) group.permissions = permissions;
  if (active !== undefined) group.active = active;

  await group.save();

  const updatedGroup = await Group.findByPk(group.id, {
    include: [{ model: User }]
  });

  const transformedGroup = {
    id: updatedGroup.id.toString(),
    name: updatedGroup.name,
    description: updatedGroup.description || '',
    permissions: updatedGroup.permissions || [],
    active: updatedGroup.active,
    memberCount: updatedGroup.Users ? updatedGroup.Users.length : 0
  };

  res.json(transformedGroup);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Groupe non trouvé' });
  }

  await group.destroy();
  res.status(204).end();
}));

module.exports = router;

