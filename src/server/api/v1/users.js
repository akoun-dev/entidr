'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const { User, Group } = require('../../../models');

const router = express.Router();

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes for users
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Group }]
  });

  const transformedUsers = users.map(user => ({
    id: user.id.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
    status: user.status,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    groups: user.Groups ? user.Groups.map(group => group.name) : []
  }));

  res.json(transformedUsers);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Group }]
  });

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  const transformedUser = {
    id: user.id.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
    status: user.status,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    groups: user.Groups ? user.Groups.map(group => group.name) : []
  };

  res.json(transformedUser);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, status, groups } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: role || 'user',
    status: status || 'active'
  });

  if (groups && groups.length > 0) {
    const groupsToAssociate = await Group.findAll({
      where: { name: groups }
    });
    await user.setGroups(groupsToAssociate);
  }

  const createdUser = await User.findByPk(user.id, {
    include: [{ model: Group }]
  });

  const transformedUser = {
    id: createdUser.id.toString(),
    username: createdUser.username,
    email: createdUser.email,
    firstName: createdUser.firstName || '',
    lastName: createdUser.lastName || '',
    role: createdUser.role,
    status: createdUser.status,
    lastLogin: createdUser.lastLogin ? createdUser.lastLogin.toISOString() : null,
    groups: createdUser.Groups ? createdUser.Groups.map(group => group.name) : []
  };

  res.status(201).json(transformedUser);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, status, groups } = req.body;

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (role) user.role = role;
  if (status) user.status = status;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  if (groups) {
    const groupsToAssociate = await Group.findAll({
      where: { name: groups }
    });
    await user.setGroups(groupsToAssociate);
  }

  const updatedUser = await User.findByPk(user.id, {
    include: [{ model: Group }]
  });

  const transformedUser = {
    id: updatedUser.id.toString(),
    username: updatedUser.username,
    email: updatedUser.email,
    firstName: updatedUser.firstName || '',
    lastName: updatedUser.lastName || '',
    role: updatedUser.role,
    status: updatedUser.status,
    lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
    groups: updatedUser.Groups ? updatedUser.Groups.map(group => group.name) : []
  };

  res.json(transformedUser);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  await user.destroy();
  res.status(204).end();
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  user.status = status;
  await user.save();

  const updatedUser = await User.findByPk(user.id, {
    include: [{ model: Group }]
  });

  const transformedUser = {
    id: updatedUser.id.toString(),
    username: updatedUser.username,
    email: updatedUser.email,
    firstName: updatedUser.firstName || '',
    lastName: updatedUser.lastName || '',
    role: updatedUser.role,
    status: updatedUser.status,
    lastLogin: updatedUser.lastLogin ? updatedUser.lastLogin.toISOString() : null,
    groups: updatedUser.Groups ? updatedUser.Groups.map(group => group.name) : []
  };

  res.json(transformedUser);
}));

module.exports = router;

