'use strict';

const express = require('express');
const router = express.Router();
const { User, Group, Parameter, Currency, Country, Language, DateFormat, NumberFormat, TimeFormat, Translation, EmailServer, SecuritySetting, ApiKey, AutomationRule, LoggingSetting, DocumentLayout, ReportTemplate, Printer, PaymentProvider, ShippingMethod, ExternalService, AuditLog, AuditConfig, Backup, BackupConfig, ThemeConfig, CustomLogo, ImportConfig, ExportConfig, ImportExportHistory, ComplianceConfig, ConsentRecord, CalendarConfig, Holiday, CalendarIntegration, Sequence, SequenceConfig, PerformanceConfig, NotificationChannel, NotificationTemplate, NotificationPreference, Notification, NotificationConfig, Workflow, WorkflowStep, WorkflowCondition, Module, Sequelize } = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = Sequelize;

// Middleware pour gérer les erreurs
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const authMiddleware = require('./middleware/auth');

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
}));

router.use(authMiddleware);

// Routes pour les utilisateurs
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.findAll({
    include: [{ model: Group }]
  });

  // Transformer les données pour correspondre à l'interface User du frontend
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

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Group }]
  });

  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Transformer les données
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

router.post('/users', asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, status, groups } = req.body;

  // Hacher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Créer l'utilisateur
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: role || 'user',
    status: status || 'active'
  });

  // Associer les groupes si spécifiés
  if (groups && groups.length > 0) {
    const groupsToAssociate = await Group.findAll({
      where: { name: groups }
    });
    await user.setGroups(groupsToAssociate);
  }

  // Récupérer l'utilisateur avec ses groupes
  const createdUser = await User.findByPk(user.id, {
    include: [{ model: Group }]
  });

  // Transformer les données
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

router.put('/users/:id', asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, status, groups } = req.body;

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Mettre à jour les champs
  if (username) user.username = username;
  if (email) user.email = email;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (role) user.role = role;
  if (status) user.status = status;

  // Mettre à jour le mot de passe si fourni
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  await user.save();

  // Mettre à jour les groupes si spécifiés
  if (groups) {
    const groupsToAssociate = await Group.findAll({
      where: { name: groups }
    });
    await user.setGroups(groupsToAssociate);
  }

  // Récupérer l'utilisateur mis à jour avec ses groupes
  const updatedUser = await User.findByPk(user.id, {
    include: [{ model: Group }]
  });

  // Transformer les données
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

router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  await user.destroy();
  res.status(204).end();
}));

router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  user.status = status;
  await user.save();

  // Récupérer l'utilisateur mis à jour avec ses groupes
  const updatedUser = await User.findByPk(user.id, {
    include: [{ model: Group }]
  });

  // Transformer les données
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

// Routes pour les groupes
router.get('/groups', asyncHandler(async (req, res) => {
  const groups = await Group.findAll({
    include: [{ model: User }]
  });

  // Transformer les données pour correspondre à l'interface Group du frontend
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

router.get('/groups/:id', asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id, {
    include: [{ model: User }]
  });

  if (!group) {
    return res.status(404).json({ message: 'Groupe non trouvé' });
  }

  // Transformer les données
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

router.post('/groups', asyncHandler(async (req, res) => {
  const { name, description, permissions, active } = req.body;

  // Créer le groupe
  const group = await Group.create({
    name,
    description,
    permissions: permissions || [],
    active: active !== undefined ? active : true
  });

  // Transformer les données
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

router.put('/groups/:id', asyncHandler(async (req, res) => {
  const { name, description, permissions, active } = req.body;

  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Groupe non trouvé' });
  }

  // Mettre à jour les champs
  if (name) group.name = name;
  if (description !== undefined) group.description = description;
  if (permissions) group.permissions = permissions;
  if (active !== undefined) group.active = active;

  await group.save();

  // Récupérer le groupe mis à jour avec ses utilisateurs
  const updatedGroup = await Group.findByPk(group.id, {
    include: [{ model: User }]
  });

  // Transformer les données
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

router.delete('/groups/:id', asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Groupe non trouvé' });
  }

  await group.destroy();
  res.status(204).end();
}));

// Routes pour les paramètres
router.get('/parameters', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll();

  // Transformer les données
  const transformedParameters = parameters.map(param => ({
    id: param.id.toString(),
    key: param.key,
    value: param.value,
    category: param.category,
    description: param.description || ''
  }));

  res.json(transformedParameters);
}));

router.get('/parameters/category/:category', asyncHandler(async (req, res) => {
  const parameters = await Parameter.findAll({
    where: { category: req.params.category }
  });

  // Transformer les données
  const transformedParameters = parameters.map(param => ({
    id: param.id.toString(),
    key: param.key,
    value: param.value,
    category: param.category,
    description: param.description || ''
  }));

  res.json(transformedParameters);
}));

router.get('/parameters/key/:key', asyncHandler(async (req, res) => {
  const parameter = await Parameter.findOne({
    where: { key: req.params.key }
  });

  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }

  // Transformer les données
  const transformedParameter = {
    id: parameter.id.toString(),
    key: parameter.key,
    value: parameter.value,
    category: parameter.category,
    description: parameter.description || ''
  };

  res.json(transformedParameter);
}));

router.put('/parameters/key/:key', asyncHandler(async (req, res) => {
  const { value } = req.body;

  const parameter = await Parameter.findOne({
    where: { key: req.params.key }
  });

  if (!parameter) {
    return res.status(404).json({ message: 'Paramètre non trouvé' });
  }

  parameter.value = value;
  await parameter.save();

  // Transformer les données
  const transformedParameter = {
    id: parameter.id.toString(),
    key: parameter.key,
    value: parameter.value,
    category: parameter.category,
    description: parameter.description || ''
  };

  res.json(transformedParameter);
}));

router.put('/parameters/batch', asyncHandler(async (req, res) => {
  const { parameters } = req.body;

  const updatedParameters = [];

  for (const param of parameters) {
    const parameter = await Parameter.findOne({
      where: { key: param.key }
    });

    if (parameter) {
      parameter.value = param.value;
      await parameter.save();

      updatedParameters.push({
        id: parameter.id.toString(),
        key: parameter.key,
        value: parameter.value,
        category: parameter.category,
        description: parameter.description || ''
      });
    }
  }

  res.json(updatedParameters);
}));

// Routes pour les devises
router.get('/currencies', asyncHandler(async (req, res) => {
  const currencies = await Currency.findAll();

  // Transformer les données
  const transformedCurrencies = currencies.map(currency => ({
    id: currency.id.toString(),
    name: currency.name,
    symbol: currency.symbol,
    code: currency.code,
    rate: currency.rate,
    position: currency.position,
    decimal_places: currency.decimal_places,
    rounding: currency.rounding,
    active: currency.active
  }));

  res.json(transformedCurrencies);
}));

router.get('/currencies/:id', asyncHandler(async (req, res) => {
  const currency = await Currency.findByPk(req.params.id);

  if (!currency) {
    return res.status(404).json({ message: 'Devise non trouvée' });
  }

  // Transformer les données
  const transformedCurrency = {
    id: currency.id.toString(),
    name: currency.name,
    symbol: currency.symbol,
    code: currency.code,
    rate: currency.rate,
    position: currency.position,
    decimal_places: currency.decimal_places,
    rounding: currency.rounding,
    active: currency.active
  };

  res.json(transformedCurrency);
}));

router.post('/currencies', asyncHandler(async (req, res) => {
  const { name, symbol, code, rate, position, decimal_places, rounding, active } = req.body;

  // Vérifier si la devise existe déjà
  const existingCurrency = await Currency.findOne({
    where: { code }
  });

  if (existingCurrency) {
    return res.status(400).json({ message: 'Une devise avec ce code existe déjà' });
  }

  // Créer la devise
  const currency = await Currency.create({
    name,
    symbol,
    code,
    rate: parseFloat(rate),
    position,
    decimal_places: parseInt(decimal_places),
    rounding: parseFloat(rounding),
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedCurrency = {
    id: currency.id.toString(),
    name: currency.name,
    symbol: currency.symbol,
    code: currency.code,
    rate: currency.rate,
    position: currency.position,
    decimal_places: currency.decimal_places,
    rounding: currency.rounding,
    active: currency.active
  };

  res.status(201).json(transformedCurrency);
}));

router.put('/currencies/:id', asyncHandler(async (req, res) => {
  const { name, symbol, code, rate, position, decimal_places, rounding, active } = req.body;

  const currency = await Currency.findByPk(req.params.id);
  if (!currency) {
    return res.status(404).json({ message: 'Devise non trouvée' });
  }

  // Vérifier si le code est déjà utilisé par une autre devise
  if (code && code !== currency.code) {
    const existingCurrency = await Currency.findOne({
      where: { code }
    });

    if (existingCurrency) {
      return res.status(400).json({ message: 'Une devise avec ce code existe déjà' });
    }
  }

  // Mettre à jour les champs
  if (name) currency.name = name;
  if (symbol) currency.symbol = symbol;
  if (code) currency.code = code;
  if (rate !== undefined) currency.rate = parseFloat(rate);
  if (position) currency.position = position;
  if (decimal_places !== undefined) currency.decimal_places = parseInt(decimal_places);
  if (rounding !== undefined) currency.rounding = parseFloat(rounding);
  if (active !== undefined) currency.active = active;

  await currency.save();

  // Transformer les données
  const transformedCurrency = {
    id: currency.id.toString(),
    name: currency.name,
    symbol: currency.symbol,
    code: currency.code,
    rate: currency.rate,
    position: currency.position,
    decimal_places: currency.decimal_places,
    rounding: currency.rounding,
    active: currency.active
  };

  res.json(transformedCurrency);
}));

router.delete('/currencies/:id', asyncHandler(async (req, res) => {
  const currency = await Currency.findByPk(req.params.id);
  if (!currency) {
    return res.status(404).json({ message: 'Devise non trouvée' });
  }

  await currency.destroy();
  res.status(204).end();
}));

router.patch('/currencies/:id/toggle-status', asyncHandler(async (req, res) => {
  const currency = await Currency.findByPk(req.params.id);
  if (!currency) {
    return res.status(404).json({ message: 'Devise non trouvée' });
  }

  currency.active = !currency.active;
  await currency.save();

  // Transformer les données
  const transformedCurrency = {
    id: currency.id.toString(),
    name: currency.name,
    symbol: currency.symbol,
    code: currency.code,
    rate: currency.rate,
    position: currency.position,
    decimal_places: currency.decimal_places,
    rounding: currency.rounding,
    active: currency.active
  };

  res.json(transformedCurrency);
}));

// Routes pour les pays
router.get('/countries', asyncHandler(async (req, res) => {
  const countries = await Country.findAll();

  // Transformer les données
  const transformedCountries = countries.map(country => ({
    id: country.id.toString(),
    name: country.name,
    code: country.code,
    phone_code: country.phone_code,
    currency_code: country.currency_code,
    region: country.region,
    active: country.active
  }));

  res.json(transformedCountries);
}));

router.get('/countries/:id', asyncHandler(async (req, res) => {
  const country = await Country.findByPk(req.params.id);

  if (!country) {
    return res.status(404).json({ message: 'Pays non trouvé' });
  }

  // Transformer les données
  const transformedCountry = {
    id: country.id.toString(),
    name: country.name,
    code: country.code,
    phone_code: country.phone_code,
    currency_code: country.currency_code,
    region: country.region,
    active: country.active
  };

  res.json(transformedCountry);
}));

router.post('/countries', asyncHandler(async (req, res) => {
  const { name, code, phone_code, currency_code, region, active } = req.body;

  // Vérifier si le pays existe déjà
  const existingCountry = await Country.findOne({
    where: { code }
  });

  if (existingCountry) {
    return res.status(400).json({ message: 'Un pays avec ce code existe déjà' });
  }

  // Créer le pays
  const country = await Country.create({
    name,
    code,
    phone_code,
    currency_code,
    region,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedCountry = {
    id: country.id.toString(),
    name: country.name,
    code: country.code,
    phone_code: country.phone_code,
    currency_code: country.currency_code,
    region: country.region,
    active: country.active
  };

  res.status(201).json(transformedCountry);
}));

router.put('/countries/:id', asyncHandler(async (req, res) => {
  const { name, code, phone_code, currency_code, region, active } = req.body;

  const country = await Country.findByPk(req.params.id);
  if (!country) {
    return res.status(404).json({ message: 'Pays non trouvé' });
  }

  // Vérifier si le code est déjà utilisé par un autre pays
  if (code && code !== country.code) {
    const existingCountry = await Country.findOne({
      where: { code }
    });

    if (existingCountry) {
      return res.status(400).json({ message: 'Un pays avec ce code existe déjà' });
    }
  }

  // Mettre à jour les champs
  if (name) country.name = name;
  if (code) country.code = code;
  if (phone_code !== undefined) country.phone_code = phone_code;
  if (currency_code !== undefined) country.currency_code = currency_code;
  if (region !== undefined) country.region = region;
  if (active !== undefined) country.active = active;

  await country.save();

  // Transformer les données
  const transformedCountry = {
    id: country.id.toString(),
    name: country.name,
    code: country.code,
    phone_code: country.phone_code,
    currency_code: country.currency_code,
    region: country.region,
    active: country.active
  };

  res.json(transformedCountry);
}));

router.delete('/countries/:id', asyncHandler(async (req, res) => {
  const country = await Country.findByPk(req.params.id);
  if (!country) {
    return res.status(404).json({ message: 'Pays non trouvé' });
  }

  await country.destroy();
  res.status(204).end();
}));

router.patch('/countries/:id/toggle-status', asyncHandler(async (req, res) => {
  const country = await Country.findByPk(req.params.id);
  if (!country) {
    return res.status(404).json({ message: 'Pays non trouvé' });
  }

  country.active = !country.active;
  await country.save();

  // Transformer les données
  const transformedCountry = {
    id: country.id.toString(),
    name: country.name,
    code: country.code,
    phone_code: country.phone_code,
    currency_code: country.currency_code,
    region: country.region,
    active: country.active
  };

  res.json(transformedCountry);
}));

// Routes pour les langues
router.get('/languages', asyncHandler(async (req, res) => {
  const languages = await Language.findAll();

  // Transformer les données
  const transformedLanguages = languages.map(language => ({
    id: language.id.toString(),
    name: language.name,
    code: language.code,
    native_name: language.native_name,
    direction: language.direction,
    is_default: language.is_default,
    active: language.active
  }));

  res.json(transformedLanguages);
}));

router.get('/languages/:id', asyncHandler(async (req, res) => {
  const language = await Language.findByPk(req.params.id);

  if (!language) {
    return res.status(404).json({ message: 'Langue non trouvée' });
  }

  // Transformer les données
  const transformedLanguage = {
    id: language.id.toString(),
    name: language.name,
    code: language.code,
    native_name: language.native_name,
    direction: language.direction,
    is_default: language.is_default,
    active: language.active
  };

  res.json(transformedLanguage);
}));

router.post('/languages', asyncHandler(async (req, res) => {
  const { name, code, native_name, direction, is_default, active } = req.body;

  // Vérifier si la langue existe déjà
  const existingLanguage = await Language.findOne({
    where: { code }
  });

  if (existingLanguage) {
    return res.status(400).json({ message: 'Une langue avec ce code existe déjà' });
  }

  // Si cette langue est définie comme langue par défaut, désactiver les autres langues par défaut
  if (is_default) {
    await Language.update(
      { is_default: false },
      { where: { is_default: true } }
    );
  }

  // Créer la langue
  const language = await Language.create({
    name,
    code,
    native_name,
    direction: direction || 'ltr',
    is_default: is_default !== undefined ? is_default : false,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedLanguage = {
    id: language.id.toString(),
    name: language.name,
    code: language.code,
    native_name: language.native_name,
    direction: language.direction,
    is_default: language.is_default,
    active: language.active
  };

  res.status(201).json(transformedLanguage);
}));

router.put('/languages/:id', asyncHandler(async (req, res) => {
  const { name, code, native_name, direction, is_default, active } = req.body;

  const language = await Language.findByPk(req.params.id);
  if (!language) {
    return res.status(404).json({ message: 'Langue non trouvée' });
  }

  // Vérifier si le code est déjà utilisé par une autre langue
  if (code && code !== language.code) {
    const existingLanguage = await Language.findOne({
      where: { code }
    });

    if (existingLanguage) {
      return res.status(400).json({ message: 'Une langue avec ce code existe déjà' });
    }
  }

  // Si cette langue est définie comme langue par défaut, désactiver les autres langues par défaut
  if (is_default && !language.is_default) {
    await Language.update(
      { is_default: false },
      { where: { is_default: true } }
    );
  }

  // Mettre à jour les champs
  if (name) language.name = name;
  if (code) language.code = code;
  if (native_name !== undefined) language.native_name = native_name;
  if (direction) language.direction = direction;
  if (is_default !== undefined) language.is_default = is_default;
  if (active !== undefined) language.active = active;

  await language.save();

  // Transformer les données
  const transformedLanguage = {
    id: language.id.toString(),
    name: language.name,
    code: language.code,
    native_name: language.native_name,
    direction: language.direction,
    is_default: language.is_default,
    active: language.active
  };

  res.json(transformedLanguage);
}));

router.delete('/languages/:id', asyncHandler(async (req, res) => {
  const language = await Language.findByPk(req.params.id);
  if (!language) {
    return res.status(404).json({ message: 'Langue non trouvée' });
  }

  // Empêcher la suppression de la langue par défaut
  if (language.is_default) {
    return res.status(400).json({ message: 'Impossible de supprimer la langue par défaut' });
  }

  await language.destroy();
  res.status(204).end();
}));

router.patch('/languages/:id/toggle-status', asyncHandler(async (req, res) => {
  const language = await Language.findByPk(req.params.id);
  if (!language) {
    return res.status(404).json({ message: 'Langue non trouvée' });
  }

  // Empêcher la désactivation de la langue par défaut
  if (language.is_default && language.active) {
    return res.status(400).json({ message: 'Impossible de désactiver la langue par défaut' });
  }

  language.active = !language.active;
  await language.save();

  // Transformer les données
  const transformedLanguage = {
    id: language.id.toString(),
    name: language.name,
    code: language.code,
    native_name: language.native_name,
    direction: language.direction,
    is_default: language.is_default,
    active: language.active
  };

  res.json(transformedLanguage);
}));

router.patch('/languages/:id/set-default', asyncHandler(async (req, res) => {
  const language = await Language.findByPk(req.params.id);
  if (!language) {
    return res.status(404).json({ message: 'Langue non trouvée' });
  }

  // Vérifier si la langue est active
  if (!language.active) {
    return res.status(400).json({ message: 'Impossible de définir une langue inactive comme langue par défaut' });
  }

  // Désactiver toutes les langues par défaut
  await Language.update(
    { is_default: false },
    { where: { is_default: true } }
  );

  // Définir cette langue comme langue par défaut
  language.is_default = true;
  await language.save();

  // Transformer les données
  const transformedLanguage = {
    id: language.id.toString(),
    name: language.name,
    code: language.code,
    native_name: language.native_name,
    direction: language.direction,
    is_default: language.is_default,
    active: language.active
  };

  res.json(transformedLanguage);
}));

// Routes pour les formats de date
router.get('/dateformats', asyncHandler(async (req, res) => {
  const dateFormats = await DateFormat.findAll();

  // Transformer les données
  const transformedDateFormats = dateFormats.map(format => ({
    id: format.id.toString(),
    name: format.name,
    format: format.format,
    description: format.description,
    type: format.type,
    is_default: format.is_default,
    active: format.active
  }));

  res.json(transformedDateFormats);
}));

router.get('/dateformats/:id', asyncHandler(async (req, res) => {
  const dateFormat = await DateFormat.findByPk(req.params.id);

  if (!dateFormat) {
    return res.status(404).json({ message: 'Format de date non trouvé' });
  }

  // Transformer les données
  const transformedDateFormat = {
    id: dateFormat.id.toString(),
    name: dateFormat.name,
    format: dateFormat.format,
    description: dateFormat.description,
    type: dateFormat.type,
    is_default: dateFormat.is_default,
    active: dateFormat.active
  };

  res.json(transformedDateFormat);
}));

router.post('/dateformats', asyncHandler(async (req, res) => {
  console.log('POST /dateformats - Données reçues:', req.body);

  const { name, format, description, type, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !format || !type) {
    console.log('Données manquantes:', { name, format, type });
    return res.status(400).json({ message: 'Les champs name, format et type sont requis' });
  }

  // Vérifier si le format existe déjà
  const existingFormat = await DateFormat.findOne({
    where: { format }
  });

  if (existingFormat) {
    console.log('Format existant:', existingFormat.format);
    return res.status(400).json({ message: 'Un format avec ce motif existe déjà' });
  }

  // Si ce format est défini comme format par défaut, désactiver les autres formats par défaut du même type
  if (is_default) {
    await DateFormat.update(
      { is_default: false },
      { where: { type, is_default: true } }
    );
  }

  // Créer le format
  const dateFormat = await DateFormat.create({
    name,
    format,
    description,
    type: type || 'date',
    is_default: is_default !== undefined ? is_default : false,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedDateFormat = {
    id: dateFormat.id.toString(),
    name: dateFormat.name,
    format: dateFormat.format,
    description: dateFormat.description,
    type: dateFormat.type,
    is_default: dateFormat.is_default,
    active: dateFormat.active
  };

  res.status(201).json(transformedDateFormat);
}));

router.put('/dateformats/:id', asyncHandler(async (req, res) => {
  console.log('PUT /dateformats/:id - Données reçues:', req.body);

  const { name, format, description, type, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !format || !type) {
    console.log('Données manquantes:', { name, format, type });
    return res.status(400).json({ message: 'Les champs name, format et type sont requis' });
  }

  const dateFormat = await DateFormat.findByPk(req.params.id);
  if (!dateFormat) {
    return res.status(404).json({ message: 'Format de date non trouvé' });
  }

  // Vérifier si le format est déjà utilisé par un autre format
  if (format && format !== dateFormat.format) {
    const existingFormat = await DateFormat.findOne({
      where: { format }
    });

    if (existingFormat) {
      return res.status(400).json({ message: 'Un format avec ce motif existe déjà' });
    }
  }

  // Si ce format est défini comme format par défaut, désactiver les autres formats par défaut du même type
  if (is_default && !dateFormat.is_default) {
    await DateFormat.update(
      { is_default: false },
      { where: { type: type || dateFormat.type, is_default: true } }
    );
  }

  // Mettre à jour les champs
  if (name) dateFormat.name = name;
  if (format) dateFormat.format = format;
  if (description !== undefined) dateFormat.description = description;
  if (type) dateFormat.type = type;
  if (is_default !== undefined) dateFormat.is_default = is_default;
  if (active !== undefined) dateFormat.active = active;

  await dateFormat.save();

  // Transformer les données
  const transformedDateFormat = {
    id: dateFormat.id.toString(),
    name: dateFormat.name,
    format: dateFormat.format,
    description: dateFormat.description,
    type: dateFormat.type,
    is_default: dateFormat.is_default,
    active: dateFormat.active
  };

  res.json(transformedDateFormat);
}));

router.delete('/dateformats/:id', asyncHandler(async (req, res) => {
  const dateFormat = await DateFormat.findByPk(req.params.id);
  if (!dateFormat) {
    return res.status(404).json({ message: 'Format de date non trouvé' });
  }

  // Empêcher la suppression du format par défaut
  if (dateFormat.is_default) {
    return res.status(400).json({ message: 'Impossible de supprimer le format par défaut' });
  }

  await dateFormat.destroy();
  res.status(204).end();
}));

router.patch('/dateformats/:id/toggle-status', asyncHandler(async (req, res) => {
  const dateFormat = await DateFormat.findByPk(req.params.id);
  if (!dateFormat) {
    return res.status(404).json({ message: 'Format de date non trouvé' });
  }

  // Empêcher la désactivation du format par défaut
  if (dateFormat.is_default && dateFormat.active) {
    return res.status(400).json({ message: 'Impossible de désactiver le format par défaut' });
  }

  dateFormat.active = !dateFormat.active;
  await dateFormat.save();

  // Transformer les données
  const transformedDateFormat = {
    id: dateFormat.id.toString(),
    name: dateFormat.name,
    format: dateFormat.format,
    description: dateFormat.description,
    type: dateFormat.type,
    is_default: dateFormat.is_default,
    active: dateFormat.active
  };

  res.json(transformedDateFormat);
}));

router.patch('/dateformats/:id/set-default', asyncHandler(async (req, res) => {
  const dateFormat = await DateFormat.findByPk(req.params.id);
  if (!dateFormat) {
    return res.status(404).json({ message: 'Format de date non trouvé' });
  }

  // Vérifier si le format est actif
  if (!dateFormat.active) {
    return res.status(400).json({ message: 'Impossible de définir un format inactif comme format par défaut' });
  }

  // Désactiver tous les formats par défaut du même type
  await DateFormat.update(
    { is_default: false },
    { where: { type: dateFormat.type, is_default: true } }
  );

  // Définir ce format comme format par défaut
  dateFormat.is_default = true;
  await dateFormat.save();

  // Transformer les données
  const transformedDateFormat = {
    id: dateFormat.id.toString(),
    name: dateFormat.name,
    format: dateFormat.format,
    description: dateFormat.description,
    type: dateFormat.type,
    is_default: dateFormat.is_default,
    active: dateFormat.active
  };

  res.json(transformedDateFormat);
}));

// Routes pour les traductions
router.get('/translations', asyncHandler(async (req, res) => {
  const translations = await Translation.findAll();

  // Transformer les données
  const transformedTranslations = translations.map(translation => ({
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.locale,
    namespace: translation.namespace,
    value: translation.value,
    is_default: false,
    active: translation.active,
    description: translation.description || ''
  }));

  res.json(transformedTranslations);
}));

router.get('/translations/:id', asyncHandler(async (req, res) => {
  const translation = await Translation.findByPk(req.params.id);

  if (!translation) {
    return res.status(404).json({ message: 'Traduction non trouvée' });
  }

  // Transformer les données
  const transformedTranslation = {
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.language_code,
    namespace: translation.namespace,
    value: translation.value,
    is_default: false, // Valeur par défaut car la colonne n'existe pas
    active: translation.active,
    description: translation.context || '' // Utiliser context comme description
  };

  res.json(transformedTranslation);
}));

router.post('/translations', asyncHandler(async (req, res) => {
  console.log('POST /translations - Données reçues:', req.body);

    const { key, locale, namespace, value, is_default, active, description } = req.body;

  // Vérifier les données requises
  if (!key || !locale || !value) {
    console.log('Données manquantes:', { key, locale, value });
    return res.status(400).json({ message: 'Les champs key, locale et value sont requis' });
  }

  // Vérifier si la traduction existe déjà
  const existingTranslation = await Translation.findOne({
    where: {
      key,
      locale,
      namespace: namespace || 'common'
    }
  });

  if (existingTranslation) {
    console.log('Traduction existante:', existingTranslation.key);
    return res.status(400).json({ message: 'Une traduction avec cette clé, cette locale et cet espace de noms existe déjà' });
  }

  // La colonne is_default n'existe pas, donc nous ignorons cette partie

  // Créer la traduction
  const translation = await Translation.create({
    key,
    locale,
    namespace: namespace || 'common',
    value,
    is_html: false,
    description: description || null,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedTranslation = {
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.language_code,
    namespace: translation.namespace,
    value: translation.value,
    is_default: translation.is_default,
    active: translation.active,
    description: translation.description
  };

  res.status(201).json(transformedTranslation);
}));

router.put('/translations/:id', asyncHandler(async (req, res) => {
  console.log('PUT /translations/:id - Données reçues:', req.body);

  const { key, locale, namespace, value, is_default, active, description } = req.body;

  // Vérifier les données requises
  if (!key || !locale || !value) {
    console.log('Données manquantes:', { key, locale, value });
    return res.status(400).json({ message: 'Les champs key, locale et value sont requis' });
  }

  const translation = await Translation.findByPk(req.params.id);
  if (!translation) {
    return res.status(404).json({ message: 'Traduction non trouvée' });
  }

  // Vérifier si la combinaison clé/locale/namespace est déjà utilisée par une autre traduction
  if (key !== translation.key || locale !== translation.locale || (namespace && namespace !== translation.namespace)) {
    const existingTranslation = await Translation.findOne({
      where: {
        key,
        locale,
        namespace: namespace || 'common'
      }
    });

    if (existingTranslation && existingTranslation.id !== translation.id) {
      return res.status(400).json({ message: 'Une traduction avec cette clé, cette locale et cet espace de noms existe déjà' });
    }
  }

  // La colonne is_default n'existe pas, donc nous ignorons cette partie

  // Mettre à jour les champs
  if (key) translation.key = key;
  if (locale) translation.locale = locale;
  if (namespace) translation.namespace = namespace;
  if (value) translation.value = value;
  if (active !== undefined) translation.active = active;
  if (description !== undefined) translation.description = description;

  await translation.save();

  // Transformer les données
  const transformedTranslation = {
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.locale,
    namespace: translation.namespace,
    value: translation.value,
    is_default: false,
    active: translation.active,
    description: translation.description || ''
  };

  res.json(transformedTranslation);
}));

router.delete('/translations/:id', asyncHandler(async (req, res) => {
  const translation = await Translation.findByPk(req.params.id);
  if (!translation) {
    return res.status(404).json({ message: 'Traduction non trouvée' });
  }

  // La colonne is_default n'existe pas, donc nous ignorons cette partie

  await translation.destroy();
  res.status(204).end();
}));

router.patch('/translations/:id/toggle-status', asyncHandler(async (req, res) => {
  const translation = await Translation.findByPk(req.params.id);
  if (!translation) {
    return res.status(404).json({ message: 'Traduction non trouvée' });
  }

  // La colonne is_default n'existe pas, donc nous ignorons cette partie

  translation.active = !translation.active;
  await translation.save();

  // Transformer les données
  const transformedTranslation = {
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.language_code,
    namespace: translation.namespace,
    value: translation.value,
    is_default: translation.is_default,
    active: translation.active,
    description: translation.description
  };

  res.json(transformedTranslation);
}));

router.patch('/translations/:id/set-default', asyncHandler(async (req, res) => {
  const translation = await Translation.findByPk(req.params.id);
  if (!translation) {
    return res.status(404).json({ message: 'Traduction non trouvée' });
  }

  // Vérifier si la traduction est active
  if (!translation.active) {
    return res.status(400).json({ message: 'Impossible de définir une traduction inactive comme traduction par défaut' });
  }

  // La colonne is_default n'existe pas, donc nous ignorons cette partie
  await translation.save();

  // Transformer les données
  const transformedTranslation = {
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.language_code,
    namespace: translation.namespace,
    value: translation.value,
    is_default: false, // Valeur par défaut car la colonne n'existe pas
    active: translation.active,
    description: translation.context || '' // Utiliser context comme description
  };

  res.json(transformedTranslation);
}));

// Récupérer toutes les traductions pour une locale spécifique
router.get('/translations/locale/:locale', asyncHandler(async (req, res) => {
  const { locale } = req.params;

  const translations = await Translation.findAll({
    where: {
      locale,
      active: true
    }
  });

  // Transformer les données en format i18next
  const transformedTranslations = {};

  translations.forEach(translation => {
    if (!transformedTranslations[translation.namespace]) {
      transformedTranslations[translation.namespace] = {};
    }

    transformedTranslations[translation.namespace][translation.key] = translation.value;
  });

  res.json(transformedTranslations);
}));

// Récupérer toutes les traductions pour une clé spécifique
router.get('/translations/key/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;

  const translations = await Translation.findAll({
    where: { key }
  });

  // Transformer les données
  const transformedTranslations = translations.map(translation => ({
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.language_code,
    namespace: translation.namespace,
    value: translation.value,
    is_default: translation.is_default,
    active: translation.active,
    description: translation.description
  }));

  res.json(transformedTranslations);
}));

// Récupérer toutes les traductions pour un namespace spécifique
router.get('/translations/namespace/:namespace', asyncHandler(async (req, res) => {
  const { namespace } = req.params;

  const translations = await Translation.findAll({
    where: { namespace }
  });

  // Transformer les données
  const transformedTranslations = translations.map(translation => ({
    id: translation.id.toString(),
    key: translation.key,
    locale: translation.language_code,
    namespace: translation.namespace,
    value: translation.value,
    is_default: translation.is_default,
    active: translation.active,
    description: translation.description
  }));

  res.json(transformedTranslations);
}));

// Routes pour les formats de nombre
router.get('/numberformats', asyncHandler(async (req, res) => {
  const numberFormats = await NumberFormat.findAll();

  // Transformer les données
  const transformedNumberFormats = numberFormats.map(format => ({
    id: format.id.toString(),
    name: format.name,
    decimal_separator: format.decimal_separator,
    thousands_separator: format.thousands_separator,
    decimal_places: format.decimal_places,
    currency_display: format.currency_display,
    is_default: format.is_default,
    active: format.active
  }));

  res.json(transformedNumberFormats);
}));

router.get('/numberformats/:id', asyncHandler(async (req, res) => {
  const numberFormat = await NumberFormat.findByPk(req.params.id);

  if (!numberFormat) {
    return res.status(404).json({ message: 'Format de nombre non trouvé' });
  }

  // Transformer les données
  const transformedNumberFormat = {
    id: numberFormat.id.toString(),
    name: numberFormat.name,
    decimal_separator: numberFormat.decimal_separator,
    thousands_separator: numberFormat.thousands_separator,
    decimal_places: numberFormat.decimal_places,
    currency_display: numberFormat.currency_display,
    is_default: numberFormat.is_default,
    active: numberFormat.active
  };

  res.json(transformedNumberFormat);
}));

router.post('/numberformats', asyncHandler(async (req, res) => {
  const { name, decimal_separator, thousands_separator, decimal_places, currency_display, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !decimal_separator || decimal_places === undefined || !currency_display) {
    return res.status(400).json({ message: 'Les champs name, decimal_separator, decimal_places et currency_display sont requis' });
  }

  // Vérifier si le format existe déjà
  const existingFormat = await NumberFormat.findOne({
    where: { name }
  });

  if (existingFormat) {
    return res.status(400).json({ message: 'Un format de nombre avec ce nom existe déjà' });
  }

  // Si ce format est défini comme format par défaut, désactiver les autres formats par défaut
  if (is_default) {
    await NumberFormat.update(
      { is_default: false },
      { where: { is_default: true } }
    );
  }

  // Créer le format
  const numberFormat = await NumberFormat.create({
    name,
    decimal_separator,
    thousands_separator,
    decimal_places,
    currency_display,
    is_default: is_default !== undefined ? is_default : false,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedNumberFormat = {
    id: numberFormat.id.toString(),
    name: numberFormat.name,
    decimal_separator: numberFormat.decimal_separator,
    thousands_separator: numberFormat.thousands_separator,
    decimal_places: numberFormat.decimal_places,
    currency_display: numberFormat.currency_display,
    is_default: numberFormat.is_default,
    active: numberFormat.active
  };

  res.status(201).json(transformedNumberFormat);
}));

router.put('/numberformats/:id', asyncHandler(async (req, res) => {
  const { name, decimal_separator, thousands_separator, decimal_places, currency_display, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !decimal_separator || decimal_places === undefined || !currency_display) {
    return res.status(400).json({ message: 'Les champs name, decimal_separator, decimal_places et currency_display sont requis' });
  }

  const numberFormat = await NumberFormat.findByPk(req.params.id);
  if (!numberFormat) {
    return res.status(404).json({ message: 'Format de nombre non trouvé' });
  }

  // Vérifier si le nom est déjà utilisé par un autre format
  if (name !== numberFormat.name) {
    const existingFormat = await NumberFormat.findOne({
      where: { name }
    });

    if (existingFormat && existingFormat.id !== numberFormat.id) {
      return res.status(400).json({ message: 'Un format de nombre avec ce nom existe déjà' });
    }
  }

  // Si ce format est défini comme format par défaut, désactiver les autres formats par défaut
  if (is_default && !numberFormat.is_default) {
    await NumberFormat.update(
      { is_default: false },
      {
        where: {
          is_default: true,
          id: { [Op.ne]: numberFormat.id }
        }
      }
    );
  }

  // Mettre à jour les champs
  numberFormat.name = name;
  numberFormat.decimal_separator = decimal_separator;
  numberFormat.thousands_separator = thousands_separator;
  numberFormat.decimal_places = decimal_places;
  numberFormat.currency_display = currency_display;
  if (is_default !== undefined) numberFormat.is_default = is_default;
  if (active !== undefined) numberFormat.active = active;

  await numberFormat.save();

  // Transformer les données
  const transformedNumberFormat = {
    id: numberFormat.id.toString(),
    name: numberFormat.name,
    decimal_separator: numberFormat.decimal_separator,
    thousands_separator: numberFormat.thousands_separator,
    decimal_places: numberFormat.decimal_places,
    currency_display: numberFormat.currency_display,
    is_default: numberFormat.is_default,
    active: numberFormat.active
  };

  res.json(transformedNumberFormat);
}));

router.delete('/numberformats/:id', asyncHandler(async (req, res) => {
  const numberFormat = await NumberFormat.findByPk(req.params.id);
  if (!numberFormat) {
    return res.status(404).json({ message: 'Format de nombre non trouvé' });
  }

  // Empêcher la suppression d'un format par défaut
  if (numberFormat.is_default) {
    return res.status(400).json({ message: 'Impossible de supprimer un format par défaut' });
  }

  await numberFormat.destroy();
  res.status(204).end();
}));

router.patch('/numberformats/:id/toggle-status', asyncHandler(async (req, res) => {
  const numberFormat = await NumberFormat.findByPk(req.params.id);
  if (!numberFormat) {
    return res.status(404).json({ message: 'Format de nombre non trouvé' });
  }

  // Empêcher la désactivation d'un format par défaut
  if (numberFormat.is_default && numberFormat.active) {
    return res.status(400).json({ message: 'Impossible de désactiver un format par défaut' });
  }

  numberFormat.active = !numberFormat.active;
  await numberFormat.save();

  // Transformer les données
  const transformedNumberFormat = {
    id: numberFormat.id.toString(),
    name: numberFormat.name,
    decimal_separator: numberFormat.decimal_separator,
    thousands_separator: numberFormat.thousands_separator,
    decimal_places: numberFormat.decimal_places,
    currency_display: numberFormat.currency_display,
    is_default: numberFormat.is_default,
    active: numberFormat.active
  };

  res.json(transformedNumberFormat);
}));

router.patch('/numberformats/:id/set-default', asyncHandler(async (req, res) => {
  const numberFormat = await NumberFormat.findByPk(req.params.id);
  if (!numberFormat) {
    return res.status(404).json({ message: 'Format de nombre non trouvé' });
  }

  // Vérifier si le format est actif
  if (!numberFormat.active) {
    return res.status(400).json({ message: 'Impossible de définir un format inactif comme format par défaut' });
  }

  // Désactiver tous les formats par défaut
  await NumberFormat.update(
    { is_default: false },
    { where: { is_default: true } }
  );

  // Définir ce format comme format par défaut
  numberFormat.is_default = true;
  await numberFormat.save();

  // Transformer les données
  const transformedNumberFormat = {
    id: numberFormat.id.toString(),
    name: numberFormat.name,
    decimal_separator: numberFormat.decimal_separator,
    thousands_separator: numberFormat.thousands_separator,
    decimal_places: numberFormat.decimal_places,
    currency_display: numberFormat.currency_display,
    is_default: numberFormat.is_default,
    active: numberFormat.active
  };

  res.json(transformedNumberFormat);
}));

// Routes pour les formats d'heure
router.get('/timeformats', asyncHandler(async (req, res) => {
  const timeFormats = await TimeFormat.findAll();

  // Transformer les données
  const transformedTimeFormats = timeFormats.map(format => ({
    id: format.id.toString(),
    name: format.name,
    format: format.format,
    example: format.example,
    region: format.region,
    uses_24_hour: format.uses_24_hour,
    is_default: format.is_default,
    active: format.active
  }));

  res.json(transformedTimeFormats);
}));

router.get('/timeformats/:id', asyncHandler(async (req, res) => {
  const timeFormat = await TimeFormat.findByPk(req.params.id);

  if (!timeFormat) {
    return res.status(404).json({ message: 'Format d\'heure non trouvé' });
  }

  // Transformer les données
  const transformedTimeFormat = {
    id: timeFormat.id.toString(),
    name: timeFormat.name,
    format: timeFormat.format,
    example: timeFormat.example,
    region: timeFormat.region,
    uses_24_hour: timeFormat.uses_24_hour,
    is_default: timeFormat.is_default,
    active: timeFormat.active
  };

  res.json(transformedTimeFormat);
}));

router.post('/timeformats', asyncHandler(async (req, res) => {
  const { name, format, example, region, uses_24_hour, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !format || !example || !region) {
    return res.status(400).json({ message: 'Les champs name, format, example et region sont requis' });
  }

  // Vérifier si le format existe déjà
  const existingFormat = await TimeFormat.findOne({
    where: { name }
  });

  if (existingFormat) {
    return res.status(400).json({ message: 'Un format d\'heure avec ce nom existe déjà' });
  }

  // Si ce format est défini comme format par défaut, désactiver les autres formats par défaut
  if (is_default) {
    await TimeFormat.update(
      { is_default: false },
      { where: { is_default: true } }
    );
  }

  // Créer le format
  const timeFormat = await TimeFormat.create({
    name,
    format,
    example,
    region,
    uses_24_hour: uses_24_hour !== undefined ? uses_24_hour : true,
    is_default: is_default !== undefined ? is_default : false,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedTimeFormat = {
    id: timeFormat.id.toString(),
    name: timeFormat.name,
    format: timeFormat.format,
    example: timeFormat.example,
    region: timeFormat.region,
    uses_24_hour: timeFormat.uses_24_hour,
    is_default: timeFormat.is_default,
    active: timeFormat.active
  };

  res.status(201).json(transformedTimeFormat);
}));

router.put('/timeformats/:id', asyncHandler(async (req, res) => {
  const { name, format, example, region, uses_24_hour, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !format || !example || !region) {
    return res.status(400).json({ message: 'Les champs name, format, example et region sont requis' });
  }

  const timeFormat = await TimeFormat.findByPk(req.params.id);
  if (!timeFormat) {
    return res.status(404).json({ message: 'Format d\'heure non trouvé' });
  }

  // Vérifier si le nom est déjà utilisé par un autre format
  if (name !== timeFormat.name) {
    const existingFormat = await TimeFormat.findOne({
      where: { name }
    });

    if (existingFormat && existingFormat.id !== timeFormat.id) {
      return res.status(400).json({ message: 'Un format d\'heure avec ce nom existe déjà' });
    }
  }

  // Si ce format est défini comme format par défaut, désactiver les autres formats par défaut
  if (is_default && !timeFormat.is_default) {
    await TimeFormat.update(
      { is_default: false },
      {
        where: {
          is_default: true,
          id: { [Op.ne]: timeFormat.id }
        }
      }
    );
  }

  // Mettre à jour les champs
  timeFormat.name = name;
  timeFormat.format = format;
  timeFormat.example = example;
  timeFormat.region = region;
  if (uses_24_hour !== undefined) timeFormat.uses_24_hour = uses_24_hour;
  if (is_default !== undefined) timeFormat.is_default = is_default;
  if (active !== undefined) timeFormat.active = active;

  await timeFormat.save();

  // Transformer les données
  const transformedTimeFormat = {
    id: timeFormat.id.toString(),
    name: timeFormat.name,
    format: timeFormat.format,
    example: timeFormat.example,
    region: timeFormat.region,
    uses_24_hour: timeFormat.uses_24_hour,
    is_default: timeFormat.is_default,
    active: timeFormat.active
  };

  res.json(transformedTimeFormat);
}));

router.delete('/timeformats/:id', asyncHandler(async (req, res) => {
  const timeFormat = await TimeFormat.findByPk(req.params.id);
  if (!timeFormat) {
    return res.status(404).json({ message: 'Format d\'heure non trouvé' });
  }

  // Empêcher la suppression d'un format par défaut
  if (timeFormat.is_default) {
    return res.status(400).json({ message: 'Impossible de supprimer un format par défaut' });
  }

  await timeFormat.destroy();
  res.status(204).end();
}));

router.patch('/timeformats/:id/toggle-status', asyncHandler(async (req, res) => {
  const timeFormat = await TimeFormat.findByPk(req.params.id);
  if (!timeFormat) {
    return res.status(404).json({ message: 'Format d\'heure non trouvé' });
  }

  // Empêcher la désactivation d'un format par défaut
  if (timeFormat.is_default && timeFormat.active) {
    return res.status(400).json({ message: 'Impossible de désactiver un format par défaut' });
  }

  timeFormat.active = !timeFormat.active;
  await timeFormat.save();

  // Transformer les données
  const transformedTimeFormat = {
    id: timeFormat.id.toString(),
    name: timeFormat.name,
    format: timeFormat.format,
    example: timeFormat.example,
    region: timeFormat.region,
    uses_24_hour: timeFormat.uses_24_hour,
    is_default: timeFormat.is_default,
    active: timeFormat.active
  };

  res.json(transformedTimeFormat);
}));

router.patch('/timeformats/:id/set-default', asyncHandler(async (req, res) => {
  const timeFormat = await TimeFormat.findByPk(req.params.id);
  if (!timeFormat) {
    return res.status(404).json({ message: 'Format d\'heure non trouvé' });
  }

  // Vérifier si le format est actif
  if (!timeFormat.active) {
    return res.status(400).json({ message: 'Impossible de définir un format inactif comme format par défaut' });
  }

  // Désactiver tous les formats par défaut
  await TimeFormat.update(
    { is_default: false },
    { where: { is_default: true } }
  );

  // Définir ce format comme format par défaut
  timeFormat.is_default = true;
  await timeFormat.save();

  // Transformer les données
  const transformedTimeFormat = {
    id: timeFormat.id.toString(),
    name: timeFormat.name,
    format: timeFormat.format,
    example: timeFormat.example,
    region: timeFormat.region,
    uses_24_hour: timeFormat.uses_24_hour,
    is_default: timeFormat.is_default,
    active: timeFormat.active
  };

  res.json(transformedTimeFormat);
}));

// Routes pour les serveurs d'email
router.get('/emailservers', asyncHandler(async (req, res) => {
  const emailServers = await EmailServer.findAll();

  // Transformer les données
  const transformedEmailServers = emailServers.map(server => ({
    id: server.id.toString(),
    name: server.name,
    protocol: server.protocol,
    host: server.host,
    port: server.port,
    username: server.username,
    // Ne pas renvoyer le mot de passe pour des raisons de sécurité
    password: server.password ? '********' : '',
    encryption: server.encryption,
    from_email: server.from_email,
    from_name: server.from_name,
    is_default: server.is_default,
    active: server.active
  }));

  res.json(transformedEmailServers);
}));

router.get('/emailservers/:id', asyncHandler(async (req, res) => {
  const emailServer = await EmailServer.findByPk(req.params.id);

  if (!emailServer) {
    return res.status(404).json({ message: 'Serveur d\'email non trouvé' });
  }

  // Transformer les données
  const transformedEmailServer = {
    id: emailServer.id.toString(),
    name: emailServer.name,
    protocol: emailServer.protocol,
    host: emailServer.host,
    port: emailServer.port,
    username: emailServer.username,
    // Ne pas renvoyer le mot de passe pour des raisons de sécurité
    password: emailServer.password ? '********' : '',
    encryption: emailServer.encryption,
    from_email: emailServer.from_email,
    from_name: emailServer.from_name,
    is_default: emailServer.is_default,
    active: emailServer.active
  };

  res.json(transformedEmailServer);
}));

router.post('/emailservers', asyncHandler(async (req, res) => {
  const { name, protocol, host, port, username, password, encryption, from_email, from_name, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !host || !from_email || !from_name) {
    return res.status(400).json({ message: 'Les champs name, host, from_email et from_name sont requis' });
  }

  // Vérifier si le serveur existe déjà
  const existingServer = await EmailServer.findOne({
    where: { name }
  });

  if (existingServer) {
    return res.status(400).json({ message: 'Un serveur d\'email avec ce nom existe déjà' });
  }

  // Si ce serveur est défini comme serveur par défaut, désactiver les autres serveurs par défaut
  if (is_default) {
    await EmailServer.update(
      { is_default: false },
      { where: { is_default: true } }
    );
  }

  // Créer le serveur
  const emailServer = await EmailServer.create({
    name,
    protocol: protocol || 'smtp',
    host,
    port: port || 587,
    username,
    password,
    encryption: encryption || 'tls',
    from_email,
    from_name,
    is_default: is_default !== undefined ? is_default : false,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedEmailServer = {
    id: emailServer.id.toString(),
    name: emailServer.name,
    protocol: emailServer.protocol,
    host: emailServer.host,
    port: emailServer.port,
    username: emailServer.username,
    // Ne pas renvoyer le mot de passe pour des raisons de sécurité
    password: emailServer.password ? '********' : '',
    encryption: emailServer.encryption,
    from_email: emailServer.from_email,
    from_name: emailServer.from_name,
    is_default: emailServer.is_default,
    active: emailServer.active
  };

  res.status(201).json(transformedEmailServer);
}));

router.put('/emailservers/:id', asyncHandler(async (req, res) => {
  const { name, protocol, host, port, username, password, encryption, from_email, from_name, is_default, active } = req.body;

  // Vérifier les données requises
  if (!name || !host || !from_email || !from_name) {
    return res.status(400).json({ message: 'Les champs name, host, from_email et from_name sont requis' });
  }

  const emailServer = await EmailServer.findByPk(req.params.id);
  if (!emailServer) {
    return res.status(404).json({ message: 'Serveur d\'email non trouvé' });
  }

  // Vérifier si le nom est déjà utilisé par un autre serveur
  if (name !== emailServer.name) {
    const existingServer = await EmailServer.findOne({
      where: { name }
    });

    if (existingServer && existingServer.id !== emailServer.id) {
      return res.status(400).json({ message: 'Un serveur d\'email avec ce nom existe déjà' });
    }
  }

  // Si ce serveur est défini comme serveur par défaut, désactiver les autres serveurs par défaut
  if (is_default && !emailServer.is_default) {
    await EmailServer.update(
      { is_default: false },
      {
        where: {
          is_default: true,
          id: { [Op.ne]: emailServer.id }
        }
      }
    );
  }

  // Mettre à jour les champs
  emailServer.name = name;
  if (protocol) emailServer.protocol = protocol;
  emailServer.host = host;
  if (port) emailServer.port = port;
  if (username !== undefined) emailServer.username = username;
  if (password && password !== '********') emailServer.password = password;
  if (encryption) emailServer.encryption = encryption;
  emailServer.from_email = from_email;
  emailServer.from_name = from_name;
  if (is_default !== undefined) emailServer.is_default = is_default;
  if (active !== undefined) emailServer.active = active;

  await emailServer.save();

  // Transformer les données
  const transformedEmailServer = {
    id: emailServer.id.toString(),
    name: emailServer.name,
    protocol: emailServer.protocol,
    host: emailServer.host,
    port: emailServer.port,
    username: emailServer.username,
    // Ne pas renvoyer le mot de passe pour des raisons de sécurité
    password: emailServer.password ? '********' : '',
    encryption: emailServer.encryption,
    from_email: emailServer.from_email,
    from_name: emailServer.from_name,
    is_default: emailServer.is_default,
    active: emailServer.active
  };

  res.json(transformedEmailServer);
}));

router.delete('/emailservers/:id', asyncHandler(async (req, res) => {
  const emailServer = await EmailServer.findByPk(req.params.id);
  if (!emailServer) {
    return res.status(404).json({ message: 'Serveur d\'email non trouvé' });
  }

  // Empêcher la suppression d'un serveur par défaut
  if (emailServer.is_default) {
    return res.status(400).json({ message: 'Impossible de supprimer un serveur par défaut. Veuillez d\'abord définir un autre serveur comme serveur par défaut.' });
  }

  await emailServer.destroy();
  res.status(204).end();
}));

router.patch('/emailservers/:id/toggle-status', asyncHandler(async (req, res) => {
  const emailServer = await EmailServer.findByPk(req.params.id);
  if (!emailServer) {
    return res.status(404).json({ message: 'Serveur d\'email non trouvé' });
  }

  // Empêcher la désactivation d'un serveur par défaut
  if (emailServer.is_default && emailServer.active) {
    return res.status(400).json({ message: 'Impossible de désactiver un serveur par défaut. Veuillez d\'abord définir un autre serveur comme serveur par défaut.' });
  }

  emailServer.active = !emailServer.active;
  await emailServer.save();

  // Transformer les données
  const transformedEmailServer = {
    id: emailServer.id.toString(),
    name: emailServer.name,
    protocol: emailServer.protocol,
    host: emailServer.host,
    port: emailServer.port,
    username: emailServer.username,
    // Ne pas renvoyer le mot de passe pour des raisons de sécurité
    password: emailServer.password ? '********' : '',
    encryption: emailServer.encryption,
    from_email: emailServer.from_email,
    from_name: emailServer.from_name,
    is_default: emailServer.is_default,
    active: emailServer.active
  };

  res.json(transformedEmailServer);
}));

router.patch('/emailservers/:id/set-default', asyncHandler(async (req, res) => {
  const emailServer = await EmailServer.findByPk(req.params.id);
  if (!emailServer) {
    return res.status(404).json({ message: 'Serveur d\'email non trouvé' });
  }

  // Vérifier si le serveur est actif
  if (!emailServer.active) {
    return res.status(400).json({ message: 'Impossible de définir un serveur inactif comme serveur par défaut' });
  }

  // Désactiver tous les serveurs par défaut
  await EmailServer.update(
    { is_default: false },
    { where: { is_default: true } }
  );

  // Définir ce serveur comme serveur par défaut
  emailServer.is_default = true;
  await emailServer.save();

  // Transformer les données
  const transformedEmailServer = {
    id: emailServer.id.toString(),
    name: emailServer.name,
    protocol: emailServer.protocol,
    host: emailServer.host,
    port: emailServer.port,
    username: emailServer.username,
    // Ne pas renvoyer le mot de passe pour des raisons de sécurité
    password: emailServer.password ? '********' : '',
    encryption: emailServer.encryption,
    from_email: emailServer.from_email,
    from_name: emailServer.from_name,
    is_default: emailServer.is_default,
    active: emailServer.active
  };

  res.json(transformedEmailServer);
}));

router.post('/emailservers/:id/test', asyncHandler(async (req, res) => {
  const emailServer = await EmailServer.findByPk(req.params.id);
  if (!emailServer) {
    return res.status(404).json({ message: 'Serveur d\'email non trouvé' });
  }

  // Simuler un test de connexion SMTP
  // Dans une application réelle, vous utiliseriez une bibliothèque comme nodemailer pour tester la connexion

  // Simuler un délai pour le test
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simuler un succès ou un échec aléatoire
  const success = Math.random() > 0.2; // 80% de chances de succès

  if (success) {
    res.json({ success: true, message: 'Connexion au serveur SMTP réussie' });
  } else {
    res.status(500).json({ success: false, message: 'Échec de la connexion au serveur SMTP. Vérifiez vos paramètres et réessayez.' });
  }
}));

// Routes pour les paramètres de sécurité
router.get('/securitysettings', asyncHandler(async (req, res) => {
  const securitySettings = await SecuritySetting.findAll();

  // Transformer les données
  const transformedSettings = securitySettings.map(setting => {
    // Convertir la valeur selon le type
    let parsedValue = setting.value;
    if (setting.valueType === 'boolean') {
      parsedValue = setting.value === 'true';
    } else if (setting.valueType === 'number') {
      parsedValue = parseFloat(setting.value);
    } else if (setting.valueType === 'json') {
      try {
        parsedValue = JSON.parse(setting.value);
      } catch (error) {
        console.error(`Erreur lors de l'analyse JSON pour ${setting.key}:`, error);
      }
    }

    return {
      id: setting.id.toString(),
      key: setting.key,
      value: parsedValue,
      description: setting.description || '',
      valueType: setting.valueType,
      category: setting.category
    };
  });

  res.json(transformedSettings);
}));

router.get('/securitysettings/category/:category', asyncHandler(async (req, res) => {
  const securitySettings = await SecuritySetting.findAll({
    where: { category: req.params.category }
  });

  // Transformer les données
  const transformedSettings = securitySettings.map(setting => {
    // Convertir la valeur selon le type
    let parsedValue = setting.value;
    if (setting.valueType === 'boolean') {
      parsedValue = setting.value === 'true';
    } else if (setting.valueType === 'number') {
      parsedValue = parseFloat(setting.value);
    } else if (setting.valueType === 'json') {
      try {
        parsedValue = JSON.parse(setting.value);
      } catch (error) {
        console.error(`Erreur lors de l'analyse JSON pour ${setting.key}:`, error);
      }
    }

    return {
      id: setting.id.toString(),
      key: setting.key,
      value: parsedValue,
      description: setting.description || '',
      valueType: setting.valueType,
      category: setting.category
    };
  });

  res.json(transformedSettings);
}));

router.get('/securitysettings/key/:key', asyncHandler(async (req, res) => {
  const securitySetting = await SecuritySetting.findOne({
    where: { key: req.params.key }
  });

  if (!securitySetting) {
    return res.status(404).json({ message: 'Paramètre de sécurité non trouvé' });
  }

  // Convertir la valeur selon le type
  let parsedValue = securitySetting.value;
  if (securitySetting.valueType === 'boolean') {
    parsedValue = securitySetting.value === 'true';
  } else if (securitySetting.valueType === 'number') {
    parsedValue = parseFloat(securitySetting.value);
  } else if (securitySetting.valueType === 'json') {
    try {
      parsedValue = JSON.parse(securitySetting.value);
    } catch (error) {
      console.error(`Erreur lors de l'analyse JSON pour ${securitySetting.key}:`, error);
    }
  }

  // Transformer les données
  const transformedSetting = {
    id: securitySetting.id.toString(),
    key: securitySetting.key,
    value: parsedValue,
    description: securitySetting.description || '',
    valueType: securitySetting.valueType,
    category: securitySetting.category
  };

  res.json(transformedSetting);
}));

router.put('/securitysettings/key/:key', asyncHandler(async (req, res) => {
  const { value } = req.body;

  const securitySetting = await SecuritySetting.findOne({
    where: { key: req.params.key }
  });

  if (!securitySetting) {
    return res.status(404).json({ message: 'Paramètre de sécurité non trouvé' });
  }

  // Convertir la valeur selon le type avant de la stocker
  let stringValue = value;
  if (securitySetting.valueType === 'boolean') {
    stringValue = value.toString();
  } else if (securitySetting.valueType === 'number') {
    stringValue = value.toString();
  } else if (securitySetting.valueType === 'json') {
    stringValue = JSON.stringify(value);
  }

  securitySetting.value = stringValue;
  await securitySetting.save();

  // Convertir la valeur selon le type pour la réponse
  let parsedValue = securitySetting.value;
  if (securitySetting.valueType === 'boolean') {
    parsedValue = securitySetting.value === 'true';
  } else if (securitySetting.valueType === 'number') {
    parsedValue = parseFloat(securitySetting.value);
  } else if (securitySetting.valueType === 'json') {
    try {
      parsedValue = JSON.parse(securitySetting.value);
    } catch (error) {
      console.error(`Erreur lors de l'analyse JSON pour ${securitySetting.key}:`, error);
    }
  }

  // Transformer les données
  const transformedSetting = {
    id: securitySetting.id.toString(),
    key: securitySetting.key,
    value: parsedValue,
    description: securitySetting.description || '',
    valueType: securitySetting.valueType,
    category: securitySetting.category
  };

  res.json(transformedSetting);
}));

router.put('/securitysettings/batch', asyncHandler(async (req, res) => {
  const { settings } = req.body;

  const updatedSettings = [];

  for (const setting of settings) {
    const securitySetting = await SecuritySetting.findOne({
      where: { key: setting.key }
    });

    if (securitySetting) {
      // Convertir la valeur selon le type avant de la stocker
      let stringValue = setting.value;
      if (securitySetting.valueType === 'boolean') {
        stringValue = setting.value.toString();
      } else if (securitySetting.valueType === 'number') {
        stringValue = setting.value.toString();
      } else if (securitySetting.valueType === 'json') {
        stringValue = JSON.stringify(setting.value);
      }

      securitySetting.value = stringValue;
      await securitySetting.save();

      // Convertir la valeur selon le type pour la réponse
      let parsedValue = securitySetting.value;
      if (securitySetting.valueType === 'boolean') {
        parsedValue = securitySetting.value === 'true';
      } else if (securitySetting.valueType === 'number') {
        parsedValue = parseFloat(securitySetting.value);
      } else if (securitySetting.valueType === 'json') {
        try {
          parsedValue = JSON.parse(securitySetting.value);
        } catch (error) {
          console.error(`Erreur lors de l'analyse JSON pour ${securitySetting.key}:`, error);
        }
      }

      updatedSettings.push({
        id: securitySetting.id.toString(),
        key: securitySetting.key,
        value: parsedValue,
        description: securitySetting.description || '',
        valueType: securitySetting.valueType,
        category: securitySetting.category
      });
    }
  }

  res.json(updatedSettings);
}));

// Routes pour les clés API
router.get('/apikeys', asyncHandler(async (req, res) => {
  const apiKeys = await ApiKey.findAll();

  // Transformer les données
  const transformedApiKeys = apiKeys.map(apiKey => ({
    id: apiKey.id.toString(),
    name: apiKey.name,
    key: apiKey.masked_key, // Utiliser la clé masquée pour la sécurité
    permissions: apiKey.permissions,
    active: apiKey.active,
    expires_at: apiKey.expires_at ? apiKey.expires_at.toISOString() : null,
    last_used_at: apiKey.last_used_at ? apiKey.last_used_at.toISOString() : null,
    description: apiKey.description || '',
    createdAt: apiKey.createdAt.toISOString()
  }));

  res.json(transformedApiKeys);
}));

router.get('/apikeys/:id', asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findByPk(req.params.id);

  if (!apiKey) {
    return res.status(404).json({ message: 'Clé API non trouvée' });
  }

  // Transformer les données
  const transformedApiKey = {
    id: apiKey.id.toString(),
    name: apiKey.name,
    key: apiKey.masked_key, // Utiliser la clé masquée pour la sécurité
    permissions: apiKey.permissions,
    active: apiKey.active,
    expires_at: apiKey.expires_at ? apiKey.expires_at.toISOString() : null,
    last_used_at: apiKey.last_used_at ? apiKey.last_used_at.toISOString() : null,
    description: apiKey.description || '',
    createdAt: apiKey.createdAt.toISOString()
  };

  res.json(transformedApiKey);
}));

router.post('/apikeys', asyncHandler(async (req, res) => {
  const { name, permissions, active, expires_at, description } = req.body;

  // Générer une nouvelle clé API
  const key = 'sk_' + crypto.randomBytes(24).toString('hex');

  // Créer la clé API
  const apiKey = await ApiKey.create({
    name,
    key,
    permissions: permissions || ['read'],
    active: active !== undefined ? active : true,
    expires_at: expires_at || null,
    description
  });

  // Transformer les données
  const transformedApiKey = {
    id: apiKey.id.toString(),
    name: apiKey.name,
    key: apiKey.key, // Renvoyer la clé complète lors de la création
    permissions: apiKey.permissions,
    active: apiKey.active,
    expires_at: apiKey.expires_at ? apiKey.expires_at.toISOString() : null,
    last_used_at: apiKey.last_used_at ? apiKey.last_used_at.toISOString() : null,
    description: apiKey.description || '',
    createdAt: apiKey.createdAt.toISOString()
  };

  res.status(201).json(transformedApiKey);
}));

router.put('/apikeys/:id', asyncHandler(async (req, res) => {
  const { name, permissions, active, expires_at, description } = req.body;

  const apiKey = await ApiKey.findByPk(req.params.id);
  if (!apiKey) {
    return res.status(404).json({ message: 'Clé API non trouvée' });
  }

  // Mettre à jour les champs
  if (name) apiKey.name = name;
  if (permissions) apiKey.permissions = permissions;
  if (active !== undefined) apiKey.active = active;
  if (expires_at !== undefined) apiKey.expires_at = expires_at;
  if (description !== undefined) apiKey.description = description;

  await apiKey.save();

  // Transformer les données
  const transformedApiKey = {
    id: apiKey.id.toString(),
    name: apiKey.name,
    key: apiKey.masked_key, // Utiliser la clé masquée pour la sécurité
    permissions: apiKey.permissions,
    active: apiKey.active,
    expires_at: apiKey.expires_at ? apiKey.expires_at.toISOString() : null,
    last_used_at: apiKey.last_used_at ? apiKey.last_used_at.toISOString() : null,
    description: apiKey.description || '',
    createdAt: apiKey.createdAt.toISOString()
  };

  res.json(transformedApiKey);
}));

router.delete('/apikeys/:id', asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findByPk(req.params.id);
  if (!apiKey) {
    return res.status(404).json({ message: 'Clé API non trouvée' });
  }

  await apiKey.destroy();
  res.status(204).end();
}));

router.post('/apikeys/:id/regenerate', asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findByPk(req.params.id);
  if (!apiKey) {
    return res.status(404).json({ message: 'Clé API non trouvée' });
  }

  // Générer une nouvelle clé API
  const key = 'sk_' + crypto.randomBytes(24).toString('hex');
  apiKey.key = key;
  await apiKey.save();

  // Transformer les données
  const transformedApiKey = {
    id: apiKey.id.toString(),
    name: apiKey.name,
    key: apiKey.key, // Renvoyer la clé complète lors de la régénération
    permissions: apiKey.permissions,
    active: apiKey.active,
    expires_at: apiKey.expires_at ? apiKey.expires_at.toISOString() : null,
    last_used_at: apiKey.last_used_at ? apiKey.last_used_at.toISOString() : null,
    description: apiKey.description || '',
    createdAt: apiKey.createdAt.toISOString()
  };

  res.json(transformedApiKey);
}));

router.patch('/apikeys/:id/toggle', asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findByPk(req.params.id);
  if (!apiKey) {
    return res.status(404).json({ message: 'Clé API non trouvée' });
  }

  apiKey.active = !apiKey.active;
  await apiKey.save();

  // Transformer les données
  const transformedApiKey = {
    id: apiKey.id.toString(),
    name: apiKey.name,
    key: apiKey.masked_key, // Utiliser la clé masquée pour la sécurité
    permissions: apiKey.permissions,
    active: apiKey.active,
    expires_at: apiKey.expires_at ? apiKey.expires_at.toISOString() : null,
    last_used_at: apiKey.last_used_at ? apiKey.last_used_at.toISOString() : null,
    description: apiKey.description || '',
    createdAt: apiKey.createdAt.toISOString()
  };

  res.json(transformedApiKey);
}));

// Routes pour les règles d'automatisation
router.get('/automationrules', asyncHandler(async (req, res) => {
  const rules = await AutomationRule.findAll({
    order: [['priority', 'ASC']]
  });

  // Transformer les données
  const transformedRules = rules.map(rule => ({
    id: rule.id.toString(),
    name: rule.name,
    description: rule.description || '',
    trigger_type: rule.trigger_type,
    trigger_value: rule.trigger_value,
    action_type: rule.action_type,
    action_params: rule.action_params,
    enabled: rule.enabled,
    priority: rule.priority,
    last_run: rule.last_run ? rule.last_run.toISOString() : null,
    last_status: rule.last_status,
    success_count: rule.success_count,
    failure_count: rule.failure_count,
    createdAt: rule.createdAt.toISOString()
  }));

  res.json(transformedRules);
}));

router.get('/automationrules/:id', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);

  if (!rule) {
    return res.status(404).json({ message: 'Règle d\'automatisation non trouvée' });
  }

  // Transformer les données
  const transformedRule = {
    id: rule.id.toString(),
    name: rule.name,
    description: rule.description || '',
    trigger_type: rule.trigger_type,
    trigger_value: rule.trigger_value,
    action_type: rule.action_type,
    action_params: rule.action_params,
    enabled: rule.enabled,
    priority: rule.priority,
    last_run: rule.last_run ? rule.last_run.toISOString() : null,
    last_status: rule.last_status,
    success_count: rule.success_count,
    failure_count: rule.failure_count,
    createdAt: rule.createdAt.toISOString()
  };

  res.json(transformedRule);
}));

router.post('/automationrules', asyncHandler(async (req, res) => {
  const {
    name,
    description,
    trigger_type,
    trigger_value,
    action_type,
    action_params,
    enabled,
    priority
  } = req.body;

  // Créer la règle d'automatisation
  const rule = await AutomationRule.create({
    name,
    description,
    trigger_type: trigger_type || 'cron',
    trigger_value,
    action_type,
    action_params,
    enabled: enabled !== undefined ? enabled : true,
    priority: priority || 100
  });

  // Transformer les données
  const transformedRule = {
    id: rule.id.toString(),
    name: rule.name,
    description: rule.description || '',
    trigger_type: rule.trigger_type,
    trigger_value: rule.trigger_value,
    action_type: rule.action_type,
    action_params: rule.action_params,
    enabled: rule.enabled,
    priority: rule.priority,
    last_run: rule.last_run ? rule.last_run.toISOString() : null,
    last_status: rule.last_status,
    success_count: rule.success_count,
    failure_count: rule.failure_count,
    createdAt: rule.createdAt.toISOString()
  };

  res.status(201).json(transformedRule);
}));

router.put('/automationrules/:id', asyncHandler(async (req, res) => {
  const {
    name,
    description,
    trigger_type,
    trigger_value,
    action_type,
    action_params,
    enabled,
    priority
  } = req.body;

  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) {
    return res.status(404).json({ message: 'Règle d\'automatisation non trouvée' });
  }

  // Mettre à jour les champs
  if (name) rule.name = name;
  if (description !== undefined) rule.description = description;
  if (trigger_type) rule.trigger_type = trigger_type;
  if (trigger_value) rule.trigger_value = trigger_value;
  if (action_type) rule.action_type = action_type;
  if (action_params) rule.action_params = action_params;
  if (enabled !== undefined) rule.enabled = enabled;
  if (priority !== undefined) rule.priority = priority;

  await rule.save();

  // Transformer les données
  const transformedRule = {
    id: rule.id.toString(),
    name: rule.name,
    description: rule.description || '',
    trigger_type: rule.trigger_type,
    trigger_value: rule.trigger_value,
    action_type: rule.action_type,
    action_params: rule.action_params,
    enabled: rule.enabled,
    priority: rule.priority,
    last_run: rule.last_run ? rule.last_run.toISOString() : null,
    last_status: rule.last_status,
    success_count: rule.success_count,
    failure_count: rule.failure_count,
    createdAt: rule.createdAt.toISOString()
  };

  res.json(transformedRule);
}));

router.delete('/automationrules/:id', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) {
    return res.status(404).json({ message: 'Règle d\'automatisation non trouvée' });
  }

  await rule.destroy();
  res.status(204).end();
}));

router.patch('/automationrules/:id/toggle', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) {
    return res.status(404).json({ message: 'Règle d\'automatisation non trouvée' });
  }

  rule.enabled = !rule.enabled;
  await rule.save();

  // Transformer les données
  const transformedRule = {
    id: rule.id.toString(),
    name: rule.name,
    description: rule.description || '',
    trigger_type: rule.trigger_type,
    trigger_value: rule.trigger_value,
    action_type: rule.action_type,
    action_params: rule.action_params,
    enabled: rule.enabled,
    priority: rule.priority,
    last_run: rule.last_run ? rule.last_run.toISOString() : null,
    last_status: rule.last_status,
    success_count: rule.success_count,
    failure_count: rule.failure_count,
    createdAt: rule.createdAt.toISOString()
  };

  res.json(transformedRule);
}));

router.post('/automationrules/:id/run', asyncHandler(async (req, res) => {
  const rule = await AutomationRule.findByPk(req.params.id);
  if (!rule) {
    return res.status(404).json({ message: 'Règle d\'automatisation non trouvée' });
  }

  // Simuler l'exécution de la règle (dans une vraie application, cela déclencherait l'action réelle)
  const success = Math.random() > 0.2; // 80% de chance de succès pour la simulation

  rule.last_run = new Date();
  rule.last_status = success ? 'success' : 'failure';

  if (success) {
    rule.success_count += 1;
  } else {
    rule.failure_count += 1;
  }

  await rule.save();

  // Transformer les données
  const transformedRule = {
    id: rule.id.toString(),
    name: rule.name,
    description: rule.description || '',
    trigger_type: rule.trigger_type,
    trigger_value: rule.trigger_value,
    action_type: rule.action_type,
    action_params: rule.action_params,
    enabled: rule.enabled,
    priority: rule.priority,
    last_run: rule.last_run ? rule.last_run.toISOString() : null,
    last_status: rule.last_status,
    success_count: rule.success_count,
    failure_count: rule.failure_count,
    createdAt: rule.createdAt.toISOString()
  };

  res.json({
    rule: transformedRule,
    execution: {
      success,
      message: success ? 'Règle exécutée avec succès' : 'Échec de l\'exécution de la règle',
      timestamp: new Date().toISOString()
    }
  });
}));

// Routes pour les paramètres de journalisation
router.get('/loggingsettings', asyncHandler(async (req, res) => {
  const settings = await LoggingSetting.findAll();

  // Transformer les données
  const transformedSettings = settings.map(setting => {
    let value = setting.value;

    // Convertir la valeur selon son type
    if (setting.valueType === 'boolean') {
      value = value === 'true';
    } else if (setting.valueType === 'number') {
      value = Number(value);
    } else if (setting.valueType === 'json') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.error(`Erreur lors de la conversion JSON pour ${setting.key}:`, e);
      }
    }

    return {
      id: setting.id.toString(),
      key: setting.key,
      value: value,
      description: setting.description || '',
      valueType: setting.valueType,
      category: setting.category
    };
  });

  res.json(transformedSettings);
}));

router.get('/loggingsettings/:key', asyncHandler(async (req, res) => {
  const setting = await LoggingSetting.findOne({
    where: { key: req.params.key }
  });

  if (!setting) {
    return res.status(404).json({ message: 'Paramètre de journalisation non trouvé' });
  }

  // Convertir la valeur selon son type
  let value = setting.value;
  if (setting.valueType === 'boolean') {
    value = value === 'true';
  } else if (setting.valueType === 'number') {
    value = Number(value);
  } else if (setting.valueType === 'json') {
    try {
      value = JSON.parse(value);
    } catch (e) {
      console.error(`Erreur lors de la conversion JSON pour ${setting.key}:`, e);
    }
  }

  // Transformer les données
  const transformedSetting = {
    id: setting.id.toString(),
    key: setting.key,
    value: value,
    description: setting.description || '',
    valueType: setting.valueType,
    category: setting.category
  };

  res.json(transformedSetting);
}));

router.put('/loggingsettings/:key', asyncHandler(async (req, res) => {
  const { value } = req.body;

  const setting = await LoggingSetting.findOne({
    where: { key: req.params.key }
  });

  if (!setting) {
    return res.status(404).json({ message: 'Paramètre de journalisation non trouvé' });
  }

  // Convertir la valeur en chaîne selon son type
  let stringValue;
  if (typeof value === 'boolean') {
    stringValue = value.toString();
  } else if (typeof value === 'number') {
    stringValue = value.toString();
  } else if (typeof value === 'object') {
    stringValue = JSON.stringify(value);
  } else {
    stringValue = value;
  }

  setting.value = stringValue;
  await setting.save();

  // Convertir la valeur selon son type pour la réponse
  let convertedValue = setting.value;
  if (setting.valueType === 'boolean') {
    convertedValue = convertedValue === 'true';
  } else if (setting.valueType === 'number') {
    convertedValue = Number(convertedValue);
  } else if (setting.valueType === 'json') {
    try {
      convertedValue = JSON.parse(convertedValue);
    } catch (e) {
      console.error(`Erreur lors de la conversion JSON pour ${setting.key}:`, e);
    }
  }

  // Transformer les données
  const transformedSetting = {
    id: setting.id.toString(),
    key: setting.key,
    value: convertedValue,
    description: setting.description || '',
    valueType: setting.valueType,
    category: setting.category
  };

  res.json(transformedSetting);
}));

router.put('/loggingsettings/batch', asyncHandler(async (req, res) => {
  const { settings } = req.body;

  const updatedSettings = [];

  for (const settingData of settings) {
    const setting = await LoggingSetting.findOne({
      where: { key: settingData.key }
    });

    if (setting) {
      // Convertir la valeur en chaîne selon son type
      let stringValue;
      if (typeof settingData.value === 'boolean') {
        stringValue = settingData.value.toString();
      } else if (typeof settingData.value === 'number') {
        stringValue = settingData.value.toString();
      } else if (typeof settingData.value === 'object') {
        stringValue = JSON.stringify(settingData.value);
      } else {
        stringValue = settingData.value;
      }

      setting.value = stringValue;
      await setting.save();

      // Convertir la valeur selon son type pour la réponse
      let convertedValue = setting.value;
      if (setting.valueType === 'boolean') {
        convertedValue = convertedValue === 'true';
      } else if (setting.valueType === 'number') {
        convertedValue = Number(convertedValue);
      } else if (setting.valueType === 'json') {
        try {
          convertedValue = JSON.parse(convertedValue);
        } catch (e) {
          console.error(`Erreur lors de la conversion JSON pour ${setting.key}:`, e);
        }
      }

      updatedSettings.push({
        id: setting.id.toString(),
        key: setting.key,
        value: convertedValue,
        description: setting.description || '',
        valueType: setting.valueType,
        category: setting.category
      });
    }
  }

  res.json(updatedSettings);
}));

// Routes pour les modèles de documents
router.get('/documentlayouts', asyncHandler(async (req, res) => {
  const layouts = await DocumentLayout.findAll({
    order: [['type', 'ASC'], ['name', 'ASC']]
  });

  // Transformer les données
  const transformedLayouts = layouts.map(layout => ({
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    previewUrl: layout.previewUrl,
    status: layout.status,
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedLayouts);
}));

router.get('/documentlayouts/:id', asyncHandler(async (req, res) => {
  const layout = await DocumentLayout.findByPk(req.params.id);

  if (!layout) {
    return res.status(404).json({ message: 'Modèle de document non trouvé' });
  }

  // Transformer les données
  const transformedLayout = {
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    content: layout.content,
    metadata: layout.metadata,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    margins: layout.margins,
    previewUrl: layout.previewUrl,
    status: layout.status,
    createdAt: layout.createdAt.toISOString(),
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedLayout);
}));

router.post('/documentlayouts', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    content,
    metadata,
    isDefault,
    orientation,
    paperSize,
    margins,
    previewUrl,
    status
  } = req.body;

  // Si ce modèle est défini comme modèle par défaut, désactiver les autres modèles par défaut du même type
  if (isDefault) {
    await DocumentLayout.update(
      { isDefault: false },
      { where: { type, isDefault: true } }
    );
  }

  // Créer le modèle de document
  const layout = await DocumentLayout.create({
    name,
    type,
    content,
    metadata,
    isDefault: isDefault !== undefined ? isDefault : false,
    orientation: orientation || 'portrait',
    paperSize: paperSize || 'A4',
    margins: margins || { top: 10, right: 10, bottom: 10, left: 10 },
    previewUrl,
    status: status || 'active'
  });

  // Transformer les données
  const transformedLayout = {
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    previewUrl: layout.previewUrl,
    status: layout.status,
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  };

  res.status(201).json(transformedLayout);
}));

router.put('/documentlayouts/:id', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    content,
    metadata,
    isDefault,
    orientation,
    paperSize,
    margins,
    previewUrl,
    status
  } = req.body;

  const layout = await DocumentLayout.findByPk(req.params.id);
  if (!layout) {
    return res.status(404).json({ message: 'Modèle de document non trouvé' });
  }

  // Si ce modèle est défini comme modèle par défaut, désactiver les autres modèles par défaut du même type
  if (isDefault && !layout.isDefault) {
    await DocumentLayout.update(
      { isDefault: false },
      {
        where: {
          type: type || layout.type,
          isDefault: true,
          id: { [Op.ne]: layout.id }
        }
      }
    );
  }

  // Mettre à jour les champs
  if (name) layout.name = name;
  if (type) layout.type = type;
  if (content) layout.content = content;
  if (metadata) layout.metadata = metadata;
  if (isDefault !== undefined) layout.isDefault = isDefault;
  if (orientation) layout.orientation = orientation;
  if (paperSize) layout.paperSize = paperSize;
  if (margins) layout.margins = margins;
  if (previewUrl) layout.previewUrl = previewUrl;
  if (status) layout.status = status;

  await layout.save();

  // Transformer les données
  const transformedLayout = {
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    previewUrl: layout.previewUrl,
    status: layout.status,
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedLayout);
}));

router.delete('/documentlayouts/:id', asyncHandler(async (req, res) => {
  const layout = await DocumentLayout.findByPk(req.params.id);
  if (!layout) {
    return res.status(404).json({ message: 'Modèle de document non trouvé' });
  }

  // Empêcher la suppression d'un modèle par défaut
  if (layout.isDefault) {
    return res.status(400).json({
      message: 'Impossible de supprimer un modèle par défaut. Veuillez d\'abord définir un autre modèle comme modèle par défaut.'
    });
  }

  await layout.destroy();
  res.status(204).end();
}));

router.patch('/documentlayouts/:id/setdefault', asyncHandler(async (req, res) => {
  const layout = await DocumentLayout.findByPk(req.params.id);
  if (!layout) {
    return res.status(404).json({ message: 'Modèle de document non trouvé' });
  }

  // Désactiver les autres modèles par défaut du même type
  await DocumentLayout.update(
    { isDefault: false },
    {
      where: {
        type: layout.type,
        isDefault: true,
        id: { [Op.ne]: layout.id }
      }
    }
  );

  // Définir ce modèle comme modèle par défaut
  layout.isDefault = true;
  await layout.save();

  // Transformer les données
  const transformedLayout = {
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    previewUrl: layout.previewUrl,
    status: layout.status,
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedLayout);
}));

router.get('/documentlayouts/type/:type', asyncHandler(async (req, res) => {
  const layouts = await DocumentLayout.findAll({
    where: { type: req.params.type },
    order: [['name', 'ASC']]
  });

  // Transformer les données
  const transformedLayouts = layouts.map(layout => ({
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    previewUrl: layout.previewUrl,
    status: layout.status,
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedLayouts);
}));

router.get('/documentlayouts/type/:type/default', asyncHandler(async (req, res) => {
  const layout = await DocumentLayout.findOne({
    where: {
      type: req.params.type,
      isDefault: true
    }
  });

  if (!layout) {
    return res.status(404).json({ message: 'Aucun modèle par défaut trouvé pour ce type de document' });
  }

  // Transformer les données
  const transformedLayout = {
    id: layout.id.toString(),
    name: layout.name,
    type: layout.type,
    content: layout.content,
    metadata: layout.metadata,
    isDefault: layout.isDefault,
    orientation: layout.orientation,
    paperSize: layout.paperSize,
    margins: layout.margins,
    previewUrl: layout.previewUrl,
    status: layout.status,
    createdAt: layout.createdAt.toISOString(),
    lastModified: layout.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedLayout);
}));

// Routes pour les modèles de rapports
router.get('/reporttemplates', asyncHandler(async (req, res) => {
  const templates = await ReportTemplate.findAll({
    order: [['category', 'ASC'], ['name', 'ASC']]
  });

  // Transformer les données
  const transformedTemplates = templates.map(template => ({
    id: template.id.toString(),
    name: template.name,
    category: template.category,
    format: template.format,
    previewUrl: template.previewUrl,
    status: template.status,
    lastModified: template.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedTemplates);
}));

router.get('/reporttemplates/:id', asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findByPk(req.params.id);

  if (!template) {
    return res.status(404).json({ message: 'Modèle de rapport non trouvé' });
  }

  // Transformer les données
  const transformedTemplate = {
    id: template.id.toString(),
    name: template.name,
    category: template.category,
    description: template.description || '',
    content: template.content,
    format: template.format,
    parameters: template.parameters,
    query: template.query,
    previewUrl: template.previewUrl,
    status: template.status,
    isShared: template.isShared,
    requiredPermissions: template.requiredPermissions,
    scheduleFrequency: template.scheduleFrequency,
    scheduleCron: template.scheduleCron,
    createdAt: template.createdAt.toISOString(),
    lastModified: template.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedTemplate);
}));

router.post('/reporttemplates', asyncHandler(async (req, res) => {
  const {
    name,
    category,
    description,
    content,
    format,
    parameters,
    query,
    previewUrl,
    status,
    isShared,
    requiredPermissions,
    scheduleFrequency,
    scheduleCron
  } = req.body;

  // Créer le modèle de rapport
  const template = await ReportTemplate.create({
    name,
    category,
    description,
    content,
    format: format || 'PDF',
    parameters,
    query,
    previewUrl,
    status: status || 'active',
    isShared: isShared !== undefined ? isShared : true,
    requiredPermissions,
    scheduleFrequency,
    scheduleCron
  });

  // Transformer les données
  const transformedTemplate = {
    id: template.id.toString(),
    name: template.name,
    category: template.category,
    format: template.format,
    previewUrl: template.previewUrl,
    status: template.status,
    lastModified: template.updatedAt.toISOString().split('T')[0]
  };

  res.status(201).json(transformedTemplate);
}));

router.put('/reporttemplates/:id', asyncHandler(async (req, res) => {
  const {
    name,
    category,
    description,
    content,
    format,
    parameters,
    query,
    previewUrl,
    status,
    isShared,
    requiredPermissions,
    scheduleFrequency,
    scheduleCron
  } = req.body;

  const template = await ReportTemplate.findByPk(req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Modèle de rapport non trouvé' });
  }

  // Mettre à jour les champs
  if (name) template.name = name;
  if (category) template.category = category;
  if (description !== undefined) template.description = description;
  if (content) template.content = content;
  if (format) template.format = format;
  if (parameters) template.parameters = parameters;
  if (query !== undefined) template.query = query;
  if (previewUrl) template.previewUrl = previewUrl;
  if (status) template.status = status;
  if (isShared !== undefined) template.isShared = isShared;
  if (requiredPermissions) template.requiredPermissions = requiredPermissions;
  if (scheduleFrequency !== undefined) template.scheduleFrequency = scheduleFrequency;
  if (scheduleCron !== undefined) template.scheduleCron = scheduleCron;

  await template.save();

  // Transformer les données
  const transformedTemplate = {
    id: template.id.toString(),
    name: template.name,
    category: template.category,
    format: template.format,
    previewUrl: template.previewUrl,
    status: template.status,
    lastModified: template.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedTemplate);
}));

router.delete('/reporttemplates/:id', asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findByPk(req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Modèle de rapport non trouvé' });
  }

  await template.destroy();
  res.status(204).end();
}));

router.get('/reporttemplates/category/:category', asyncHandler(async (req, res) => {
  const templates = await ReportTemplate.findAll({
    where: { category: req.params.category },
    order: [['name', 'ASC']]
  });

  // Transformer les données
  const transformedTemplates = templates.map(template => ({
    id: template.id.toString(),
    name: template.name,
    category: template.category,
    format: template.format,
    previewUrl: template.previewUrl,
    status: template.status,
    lastModified: template.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedTemplates);
}));

router.post('/reporttemplates/:id/generate', asyncHandler(async (req, res) => {
  const { parameters } = req.body;

  const template = await ReportTemplate.findByPk(req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Modèle de rapport non trouvé' });
  }

  // Simuler la génération d'un rapport (dans une vraie application, cela générerait réellement le rapport)
  // Ici, nous renvoyons simplement un lien de téléchargement fictif

  const reportUrl = `/reports/generated/${template.id}_${Date.now()}.${template.format.toLowerCase()}`;

  res.json({
    success: true,
    message: 'Rapport généré avec succès',
    reportUrl,
    format: template.format,
    generatedAt: new Date().toISOString()
  });
}));

// Routes pour les imprimantes
router.get('/printers', asyncHandler(async (req, res) => {
  const printers = await Printer.findAll({
    order: [['name', 'ASC']]
  });

  // Transformer les données
  const transformedPrinters = printers.map(printer => ({
    id: printer.id.toString(),
    name: printer.name,
    type: printer.type,
    connection: printer.connection,
    address: printer.address,
    port: printer.port,
    isDefault: printer.isDefault,
    status: printer.status,
    lastModified: printer.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedPrinters);
}));

router.get('/printers/:id', asyncHandler(async (req, res) => {
  const printer = await Printer.findByPk(req.params.id);

  if (!printer) {
    return res.status(404).json({ message: 'Imprimante non trouvée' });
  }

  // Transformer les données
  const transformedPrinter = {
    id: printer.id.toString(),
    name: printer.name,
    type: printer.type,
    connection: printer.connection,
    address: printer.address,
    port: printer.port,
    driver: printer.driver,
    options: printer.options,
    isDefault: printer.isDefault,
    status: printer.status,
    capabilities: printer.capabilities,
    createdAt: printer.createdAt.toISOString(),
    lastModified: printer.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedPrinter);
}));

router.post('/printers', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    connection,
    address,
    port,
    driver,
    options,
    isDefault,
    status,
    capabilities
  } = req.body;

  // Si cette imprimante est définie comme imprimante par défaut, désactiver les autres imprimantes par défaut
  if (isDefault) {
    await Printer.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
  }

  // Créer l'imprimante
  const printer = await Printer.create({
    name,
    type,
    connection,
    address,
    port,
    driver,
    options,
    isDefault: isDefault !== undefined ? isDefault : false,
    status: status || 'active',
    capabilities
  });

  // Transformer les données
  const transformedPrinter = {
    id: printer.id.toString(),
    name: printer.name,
    type: printer.type,
    connection: printer.connection,
    address: printer.address,
    port: printer.port,
    isDefault: printer.isDefault,
    status: printer.status,
    lastModified: printer.updatedAt.toISOString().split('T')[0]
  };

  res.status(201).json(transformedPrinter);
}));

router.put('/printers/:id', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    connection,
    address,
    port,
    driver,
    options,
    isDefault,
    status,
    capabilities
  } = req.body;

  const printer = await Printer.findByPk(req.params.id);
  if (!printer) {
    return res.status(404).json({ message: 'Imprimante non trouvée' });
  }

  // Si cette imprimante est définie comme imprimante par défaut, désactiver les autres imprimantes par défaut
  if (isDefault && !printer.isDefault) {
    await Printer.update(
      { isDefault: false },
      {
        where: {
          isDefault: true,
          id: { [Op.ne]: printer.id }
        }
      }
    );
  }

  // Mettre à jour les champs
  if (name) printer.name = name;
  if (type) printer.type = type;
  if (connection) printer.connection = connection;
  if (address !== undefined) printer.address = address;
  if (port !== undefined) printer.port = port;
  if (driver !== undefined) printer.driver = driver;
  if (options) printer.options = options;
  if (isDefault !== undefined) printer.isDefault = isDefault;
  if (status) printer.status = status;
  if (capabilities) printer.capabilities = capabilities;

  await printer.save();

  // Transformer les données
  const transformedPrinter = {
    id: printer.id.toString(),
    name: printer.name,
    type: printer.type,
    connection: printer.connection,
    address: printer.address,
    port: printer.port,
    isDefault: printer.isDefault,
    status: printer.status,
    lastModified: printer.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedPrinter);
}));

router.delete('/printers/:id', asyncHandler(async (req, res) => {
  const printer = await Printer.findByPk(req.params.id);
  if (!printer) {
    return res.status(404).json({ message: 'Imprimante non trouvée' });
  }

  // Empêcher la suppression d'une imprimante par défaut
  if (printer.isDefault) {
    return res.status(400).json({
      message: 'Impossible de supprimer l\'imprimante par défaut. Veuillez d\'abord définir une autre imprimante comme imprimante par défaut.'
    });
  }

  await printer.destroy();
  res.status(204).end();
}));

router.patch('/printers/:id/setdefault', asyncHandler(async (req, res) => {
  const printer = await Printer.findByPk(req.params.id);
  if (!printer) {
    return res.status(404).json({ message: 'Imprimante non trouvée' });
  }

  // Désactiver les autres imprimantes par défaut
  await Printer.update(
    { isDefault: false },
    {
      where: {
        isDefault: true,
        id: { [Op.ne]: printer.id }
      }
    }
  );

  // Définir cette imprimante comme imprimante par défaut
  printer.isDefault = true;
  await printer.save();

  // Transformer les données
  const transformedPrinter = {
    id: printer.id.toString(),
    name: printer.name,
    type: printer.type,
    connection: printer.connection,
    address: printer.address,
    port: printer.port,
    isDefault: printer.isDefault,
    status: printer.status,
    lastModified: printer.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedPrinter);
}));

router.post('/printers/:id/test', asyncHandler(async (req, res) => {
  const printer = await Printer.findByPk(req.params.id);
  if (!printer) {
    return res.status(404).json({ message: 'Imprimante non trouvée' });
  }

  // Simuler un test d'impression (dans une vraie application, cela enverrait réellement une page de test à l'imprimante)
  // Ici, nous renvoyons simplement un résultat de test fictif

  const testResult = {
    success: true,
    message: 'Test d\'impression réussi',
    printer: printer.name,
    timestamp: new Date().toISOString()
  };

  res.json(testResult);
}));

// Routes pour les fournisseurs de paiement
router.get('/paymentproviders', asyncHandler(async (req, res) => {
  const providers = await PaymentProvider.findAll({
    order: [['name', 'ASC']]
  });

  // Transformer les données
  const transformedProviders = providers.map(provider => ({
    id: provider.id.toString(),
    name: provider.name,
    type: provider.type,
    fees: provider.fees,
    isActive: provider.isActive,
    mode: provider.mode,
    lastModified: provider.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedProviders);
}));

router.get('/paymentproviders/:id', asyncHandler(async (req, res) => {
  const provider = await PaymentProvider.findByPk(req.params.id);

  if (!provider) {
    return res.status(404).json({ message: 'Fournisseur de paiement non trouvé' });
  }

  // Transformer les données
  const transformedProvider = {
    id: provider.id.toString(),
    name: provider.name,
    type: provider.type,
    apiKey: provider.apiKey,
    apiSecret: provider.apiSecret ? '••••••••••••••••' : null,
    config: provider.config,
    fees: provider.fees,
    isActive: provider.isActive,
    mode: provider.mode,
    webhookUrl: provider.webhookUrl,
    supportedMethods: provider.supportedMethods,
    supportedCurrencies: provider.supportedCurrencies,
    supportedCountries: provider.supportedCountries,
    createdAt: provider.createdAt.toISOString(),
    lastModified: provider.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedProvider);
}));

router.post('/paymentproviders', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    apiKey,
    apiSecret,
    config,
    fees,
    isActive,
    mode,
    webhookUrl,
    supportedMethods,
    supportedCurrencies,
    supportedCountries
  } = req.body;

  // Créer le fournisseur de paiement
  const provider = await PaymentProvider.create({
    name,
    type,
    apiKey,
    apiSecret,
    config,
    fees,
    isActive: isActive !== undefined ? isActive : false,
    mode: mode || 'test',
    webhookUrl,
    supportedMethods,
    supportedCurrencies,
    supportedCountries
  });

  // Transformer les données
  const transformedProvider = {
    id: provider.id.toString(),
    name: provider.name,
    type: provider.type,
    fees: provider.fees,
    isActive: provider.isActive,
    mode: provider.mode,
    lastModified: provider.updatedAt.toISOString().split('T')[0]
  };

  res.status(201).json(transformedProvider);
}));

router.put('/paymentproviders/:id', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    apiKey,
    apiSecret,
    config,
    fees,
    isActive,
    mode,
    webhookUrl,
    supportedMethods,
    supportedCurrencies,
    supportedCountries
  } = req.body;

  const provider = await PaymentProvider.findByPk(req.params.id);
  if (!provider) {
    return res.status(404).json({ message: 'Fournisseur de paiement non trouvé' });
  }

  // Mettre à jour les champs
  if (name) provider.name = name;
  if (type) provider.type = type;
  if (apiKey) provider.apiKey = apiKey;
  if (apiSecret) provider.apiSecret = apiSecret;
  if (config) provider.config = config;
  if (fees) provider.fees = fees;
  if (isActive !== undefined) provider.isActive = isActive;
  if (mode) provider.mode = mode;
  if (webhookUrl !== undefined) provider.webhookUrl = webhookUrl;
  if (supportedMethods) provider.supportedMethods = supportedMethods;
  if (supportedCurrencies) provider.supportedCurrencies = supportedCurrencies;
  if (supportedCountries) provider.supportedCountries = supportedCountries;

  await provider.save();

  // Transformer les données
  const transformedProvider = {
    id: provider.id.toString(),
    name: provider.name,
    type: provider.type,
    fees: provider.fees,
    isActive: provider.isActive,
    mode: provider.mode,
    lastModified: provider.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedProvider);
}));

router.delete('/paymentproviders/:id', asyncHandler(async (req, res) => {
  const provider = await PaymentProvider.findByPk(req.params.id);
  if (!provider) {
    return res.status(404).json({ message: 'Fournisseur de paiement non trouvé' });
  }

  await provider.destroy();
  res.status(204).end();
}));

router.patch('/paymentproviders/:id/toggle', asyncHandler(async (req, res) => {
  const provider = await PaymentProvider.findByPk(req.params.id);
  if (!provider) {
    return res.status(404).json({ message: 'Fournisseur de paiement non trouvé' });
  }

  // Inverser l'état actif
  provider.isActive = !provider.isActive;
  await provider.save();

  // Transformer les données
  const transformedProvider = {
    id: provider.id.toString(),
    name: provider.name,
    type: provider.type,
    fees: provider.fees,
    isActive: provider.isActive,
    mode: provider.mode,
    lastModified: provider.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedProvider);
}));

// Routes pour les méthodes d'expédition
router.get('/shippingmethods', asyncHandler(async (req, res) => {
  const methods = await ShippingMethod.findAll({
    order: [['displayOrder', 'ASC']]
  });

  // Transformer les données
  const transformedMethods = methods.map(method => ({
    id: method.id.toString(),
    name: method.name,
    carrier: method.carrier,
    deliveryTime: method.deliveryTime,
    price: method.price,
    isActive: method.isActive,
    displayOrder: method.displayOrder,
    lastModified: method.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedMethods);
}));

router.get('/shippingmethods/:id', asyncHandler(async (req, res) => {
  const method = await ShippingMethod.findByPk(req.params.id);

  if (!method) {
    return res.status(404).json({ message: 'Méthode d\'expédition non trouvée' });
  }

  // Transformer les données
  const transformedMethod = {
    id: method.id.toString(),
    name: method.name,
    carrier: method.carrier,
    deliveryTime: method.deliveryTime,
    price: method.price,
    isActive: method.isActive,
    description: method.description,
    pricingRules: method.pricingRules,
    availableCountries: method.availableCountries,
    maxWeight: method.maxWeight,
    maxDimensions: method.maxDimensions,
    trackingInfo: method.trackingInfo,
    displayOrder: method.displayOrder,
    createdAt: method.createdAt.toISOString(),
    lastModified: method.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedMethod);
}));

router.post('/shippingmethods', asyncHandler(async (req, res) => {
  const {
    name,
    carrier,
    deliveryTime,
    price,
    isActive,
    description,
    pricingRules,
    availableCountries,
    maxWeight,
    maxDimensions,
    trackingInfo,
    displayOrder
  } = req.body;

  // Créer la méthode d'expédition
  const method = await ShippingMethod.create({
    name,
    carrier,
    deliveryTime,
    price,
    isActive: isActive !== undefined ? isActive : false,
    description,
    pricingRules,
    availableCountries,
    maxWeight,
    maxDimensions,
    trackingInfo,
    displayOrder: displayOrder || 0
  });

  // Transformer les données
  const transformedMethod = {
    id: method.id.toString(),
    name: method.name,
    carrier: method.carrier,
    deliveryTime: method.deliveryTime,
    price: method.price,
    isActive: method.isActive,
    displayOrder: method.displayOrder,
    lastModified: method.updatedAt.toISOString().split('T')[0]
  };

  res.status(201).json(transformedMethod);
}));

router.put('/shippingmethods/:id', asyncHandler(async (req, res) => {
  const {
    name,
    carrier,
    deliveryTime,
    price,
    isActive,
    description,
    pricingRules,
    availableCountries,
    maxWeight,
    maxDimensions,
    trackingInfo,
    displayOrder
  } = req.body;

  const method = await ShippingMethod.findByPk(req.params.id);
  if (!method) {
    return res.status(404).json({ message: 'Méthode d\'expédition non trouvée' });
  }

  // Mettre à jour les champs
  if (name) method.name = name;
  if (carrier) method.carrier = carrier;
  if (deliveryTime) method.deliveryTime = deliveryTime;
  if (price) method.price = price;
  if (isActive !== undefined) method.isActive = isActive;
  if (description !== undefined) method.description = description;
  if (pricingRules) method.pricingRules = pricingRules;
  if (availableCountries) method.availableCountries = availableCountries;
  if (maxWeight !== undefined) method.maxWeight = maxWeight;
  if (maxDimensions) method.maxDimensions = maxDimensions;
  if (trackingInfo) method.trackingInfo = trackingInfo;
  if (displayOrder !== undefined) method.displayOrder = displayOrder;

  await method.save();

  // Transformer les données
  const transformedMethod = {
    id: method.id.toString(),
    name: method.name,
    carrier: method.carrier,
    deliveryTime: method.deliveryTime,
    price: method.price,
    isActive: method.isActive,
    displayOrder: method.displayOrder,
    lastModified: method.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedMethod);
}));

router.delete('/shippingmethods/:id', asyncHandler(async (req, res) => {
  const method = await ShippingMethod.findByPk(req.params.id);
  if (!method) {
    return res.status(404).json({ message: 'Méthode d\'expédition non trouvée' });
  }

  await method.destroy();
  res.status(204).end();
}));

router.patch('/shippingmethods/:id/toggle', asyncHandler(async (req, res) => {
  const method = await ShippingMethod.findByPk(req.params.id);
  if (!method) {
    return res.status(404).json({ message: 'Méthode d\'expédition non trouvée' });
  }

  // Inverser l'état actif
  method.isActive = !method.isActive;
  await method.save();

  // Transformer les données
  const transformedMethod = {
    id: method.id.toString(),
    name: method.name,
    carrier: method.carrier,
    deliveryTime: method.deliveryTime,
    price: method.price,
    isActive: method.isActive,
    displayOrder: method.displayOrder,
    lastModified: method.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedMethod);
}));

// Routes pour les services externes
router.get('/externalservices', asyncHandler(async (req, res) => {
  const services = await ExternalService.findAll({
    order: [['name', 'ASC']]
  });

  // Transformer les données
  const transformedServices = services.map(service => ({
    id: service.id.toString(),
    name: service.name,
    type: service.type,
    isActive: service.isActive,
    mode: service.mode,
    lastSyncStatus: service.lastSyncStatus,
    lastSyncDate: service.lastSyncDate ? service.lastSyncDate.toISOString() : null,
    lastModified: service.updatedAt.toISOString().split('T')[0]
  }));

  res.json(transformedServices);
}));

router.get('/externalservices/:id', asyncHandler(async (req, res) => {
  const service = await ExternalService.findByPk(req.params.id);

  if (!service) {
    return res.status(404).json({ message: 'Service externe non trouvé' });
  }

  // Transformer les données
  const transformedService = {
    id: service.id.toString(),
    name: service.name,
    type: service.type,
    apiKey: service.apiKey,
    apiSecret: service.apiSecret ? '••••••••••••••••' : null,
    baseUrl: service.baseUrl,
    config: service.config,
    isActive: service.isActive,
    mode: service.mode,
    webhookUrl: service.webhookUrl,
    authInfo: service.authInfo,
    tokenExpiry: service.tokenExpiry ? service.tokenExpiry.toISOString() : null,
    lastSyncStatus: service.lastSyncStatus,
    lastSyncDate: service.lastSyncDate ? service.lastSyncDate.toISOString() : null,
    createdAt: service.createdAt.toISOString(),
    lastModified: service.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedService);
}));

router.post('/externalservices', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    apiKey,
    apiSecret,
    baseUrl,
    config,
    isActive,
    mode,
    webhookUrl,
    authInfo
  } = req.body;

  // Créer le service externe
  const service = await ExternalService.create({
    name,
    type,
    apiKey,
    apiSecret,
    baseUrl,
    config,
    isActive: isActive !== undefined ? isActive : false,
    mode: mode || 'test',
    webhookUrl,
    authInfo,
    tokenExpiry: null,
    lastSyncStatus: null,
    lastSyncDate: null
  });

  // Transformer les données
  const transformedService = {
    id: service.id.toString(),
    name: service.name,
    type: service.type,
    isActive: service.isActive,
    mode: service.mode,
    lastSyncStatus: service.lastSyncStatus,
    lastSyncDate: service.lastSyncDate ? service.lastSyncDate.toISOString() : null,
    lastModified: service.updatedAt.toISOString().split('T')[0]
  };

  res.status(201).json(transformedService);
}));

router.put('/externalservices/:id', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    apiKey,
    apiSecret,
    baseUrl,
    config,
    isActive,
    mode,
    webhookUrl,
    authInfo
  } = req.body;

  const service = await ExternalService.findByPk(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service externe non trouvé' });
  }

  // Mettre à jour les champs
  if (name) service.name = name;
  if (type) service.type = type;
  if (apiKey) service.apiKey = apiKey;
  if (apiSecret) service.apiSecret = apiSecret;
  if (baseUrl !== undefined) service.baseUrl = baseUrl;
  if (config) service.config = config;
  if (isActive !== undefined) service.isActive = isActive;
  if (mode) service.mode = mode;
  if (webhookUrl !== undefined) service.webhookUrl = webhookUrl;
  if (authInfo) service.authInfo = authInfo;

  await service.save();

  // Transformer les données
  const transformedService = {
    id: service.id.toString(),
    name: service.name,
    type: service.type,
    isActive: service.isActive,
    mode: service.mode,
    lastSyncStatus: service.lastSyncStatus,
    lastSyncDate: service.lastSyncDate ? service.lastSyncDate.toISOString() : null,
    lastModified: service.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedService);
}));

router.delete('/externalservices/:id', asyncHandler(async (req, res) => {
  const service = await ExternalService.findByPk(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service externe non trouvé' });
  }

  await service.destroy();
  res.status(204).end();
}));

router.patch('/externalservices/:id/toggle', asyncHandler(async (req, res) => {
  const service = await ExternalService.findByPk(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service externe non trouvé' });
  }

  // Inverser l'état actif
  service.isActive = !service.isActive;
  await service.save();

  // Transformer les données
  const transformedService = {
    id: service.id.toString(),
    name: service.name,
    type: service.type,
    isActive: service.isActive,
    mode: service.mode,
    lastSyncStatus: service.lastSyncStatus,
    lastSyncDate: service.lastSyncDate ? service.lastSyncDate.toISOString() : null,
    lastModified: service.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedService);
}));

router.post('/externalservices/:id/sync', asyncHandler(async (req, res) => {
  const service = await ExternalService.findByPk(req.params.id);
  if (!service) {
    return res.status(404).json({ message: 'Service externe non trouvé' });
  }

  // Simuler une synchronisation (dans une vraie application, cela effectuerait réellement une synchronisation avec le service externe)
  // Ici, nous mettons simplement à jour les champs lastSyncStatus et lastSyncDate

  service.lastSyncStatus = 'success';
  service.lastSyncDate = new Date();
  await service.save();

  // Transformer les données
  const transformedService = {
    id: service.id.toString(),
    name: service.name,
    type: service.type,
    isActive: service.isActive,
    mode: service.mode,
    lastSyncStatus: service.lastSyncStatus,
    lastSyncDate: service.lastSyncDate ? service.lastSyncDate.toISOString() : null,
    lastModified: service.updatedAt.toISOString().split('T')[0]
  };

  res.json(transformedService);
}));

// Routes pour l'audit
router.get('/auditlogs', asyncHandler(async (req, res) => {
  const logs = await AuditLog.findAll({
    include: [{ model: User, as: 'user' }],
    order: [['timestamp', 'DESC']],
    limit: 100
  });

  // Transformer les données
  const transformedLogs = logs.map(log => ({
    id: log.id.toString(),
    date: log.timestamp.toISOString(),
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Système',
    action: log.action,
    target: `${log.targetType}${log.targetId ? ` #${log.targetId}` : ''}`,
    targetDescription: log.targetDescription || '',
    details: log.details || '',
    severity: log.severity,
    status: log.status,
    ipAddress: log.ipAddress || '',
    userAgent: log.userAgent || ''
  }));

  res.json(transformedLogs);
}));

router.get('/auditlogs/filter', asyncHandler(async (req, res) => {
  const { action, severity, userId, startDate, endDate, limit } = req.query;

  const whereClause = {};

  if (action) whereClause.action = action;
  if (severity) whereClause.severity = severity;
  if (userId) whereClause.userId = userId;

  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
    if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
  }

  const logs = await AuditLog.findAll({
    where: whereClause,
    include: [{ model: User, as: 'user' }],
    order: [['timestamp', 'DESC']],
    limit: limit ? parseInt(limit) : 100
  });

  // Transformer les données
  const transformedLogs = logs.map(log => ({
    id: log.id.toString(),
    date: log.timestamp.toISOString(),
    user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Système',
    action: log.action,
    target: `${log.targetType}${log.targetId ? ` #${log.targetId}` : ''}`,
    targetDescription: log.targetDescription || '',
    details: log.details || '',
    severity: log.severity,
    status: log.status,
    ipAddress: log.ipAddress || '',
    userAgent: log.userAgent || ''
  }));

  res.json(transformedLogs);
}));

router.get('/auditconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration d'audit (il ne devrait y avoir qu'une seule entrée)
  let config = await AuditConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await AuditConfig.create({
      retentionDays: 90,
      logLevel: 'normal',
      monitoredEvents: ['login', 'data_change', 'permission_change'],
      alertEnabled: true,
      alertThreshold: 5,
      logSensitiveDataAccess: true,
      logDataChanges: true,
      logAuthentication: true,
      logPermissionChanges: true,
      logAdminActions: true
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    retentionDays: config.retentionDays,
    logLevel: config.logLevel,
    monitoredEvents: config.monitoredEvents,
    alertEnabled: config.alertEnabled,
    alertThreshold: config.alertThreshold,
    alertEmails: config.alertEmails,
    logSensitiveDataAccess: config.logSensitiveDataAccess,
    logDataChanges: config.logDataChanges,
    logAuthentication: config.logAuthentication,
    logPermissionChanges: config.logPermissionChanges,
    logAdminActions: config.logAdminActions
  };

  res.json(transformedConfig);
}));

router.put('/auditconfig', asyncHandler(async (req, res) => {
  const {
    retentionDays,
    logLevel,
    monitoredEvents,
    alertEnabled,
    alertThreshold,
    alertEmails,
    logSensitiveDataAccess,
    logDataChanges,
    logAuthentication,
    logPermissionChanges,
    logAdminActions
  } = req.body;

  // Récupérer la configuration d'audit (il ne devrait y avoir qu'une seule entrée)
  let config = await AuditConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await AuditConfig.create({
      retentionDays: retentionDays || 90,
      logLevel: logLevel || 'normal',
      monitoredEvents: monitoredEvents || ['login', 'data_change', 'permission_change'],
      alertEnabled: alertEnabled !== undefined ? alertEnabled : true,
      alertThreshold: alertThreshold || 5,
      alertEmails: alertEmails || null,
      logSensitiveDataAccess: logSensitiveDataAccess !== undefined ? logSensitiveDataAccess : true,
      logDataChanges: logDataChanges !== undefined ? logDataChanges : true,
      logAuthentication: logAuthentication !== undefined ? logAuthentication : true,
      logPermissionChanges: logPermissionChanges !== undefined ? logPermissionChanges : true,
      logAdminActions: logAdminActions !== undefined ? logAdminActions : true
    });
  } else {
    // Mettre à jour les champs
    if (retentionDays !== undefined) config.retentionDays = retentionDays;
    if (logLevel) config.logLevel = logLevel;
    if (monitoredEvents) config.monitoredEvents = monitoredEvents;
    if (alertEnabled !== undefined) config.alertEnabled = alertEnabled;
    if (alertThreshold !== undefined) config.alertThreshold = alertThreshold;
    if (alertEmails !== undefined) config.alertEmails = alertEmails;
    if (logSensitiveDataAccess !== undefined) config.logSensitiveDataAccess = logSensitiveDataAccess;
    if (logDataChanges !== undefined) config.logDataChanges = logDataChanges;
    if (logAuthentication !== undefined) config.logAuthentication = logAuthentication;
    if (logPermissionChanges !== undefined) config.logPermissionChanges = logPermissionChanges;
    if (logAdminActions !== undefined) config.logAdminActions = logAdminActions;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    retentionDays: config.retentionDays,
    logLevel: config.logLevel,
    monitoredEvents: config.monitoredEvents,
    alertEnabled: config.alertEnabled,
    alertThreshold: config.alertThreshold,
    alertEmails: config.alertEmails,
    logSensitiveDataAccess: config.logSensitiveDataAccess,
    logDataChanges: config.logDataChanges,
    logAuthentication: config.logAuthentication,
    logPermissionChanges: config.logPermissionChanges,
    logAdminActions: config.logAdminActions
  };

  res.json(transformedConfig);
}));

// Routes pour les sauvegardes
router.get('/backups', asyncHandler(async (req, res) => {
  const backups = await Backup.findAll({
    include: [
      { model: User, as: 'user' }
    ],
    order: [['timestamp', 'DESC']]
  });

  // Transformer les données
  const transformedBackups = backups.map(backup => ({
    id: backup.id.toString(),
    name: backup.name,
    timestamp: backup.timestamp.toISOString(),
    type: backup.type,
    size: backup.size ? formatFileSize(backup.size) : 'N/A',
    storageLocation: backup.storageLocation,
    status: backup.status,
    user: backup.user ? `${backup.user.firstName} ${backup.user.lastName}` : 'Système',
    encrypted: backup.encrypted,
    expiresAt: backup.expiresAt ? backup.expiresAt.toISOString() : null,
    restored: backup.restored,
    restoredAt: backup.restoredAt ? backup.restoredAt.toISOString() : null
  }));

  res.json(transformedBackups);
}));

router.get('/backups/:id', asyncHandler(async (req, res) => {
  const backup = await Backup.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user' }
    ]
  });

  if (!backup) {
    return res.status(404).json({ message: 'Sauvegarde non trouvée' });
  }

  // Transformer les données
  const transformedBackup = {
    id: backup.id.toString(),
    name: backup.name,
    timestamp: backup.timestamp.toISOString(),
    type: backup.type,
    size: backup.size ? formatFileSize(backup.size) : 'N/A',
    storageLocation: backup.storageLocation,
    localPath: backup.localPath,
    cloudPath: backup.cloudPath,
    status: backup.status,
    errorDetails: backup.errorDetails,
    user: backup.user ? `${backup.user.firstName} ${backup.user.lastName}` : 'Système',
    encrypted: backup.encrypted,
    encryptionKeyId: backup.encryptionKeyId,
    content: backup.content,
    checksum: backup.checksum,
    expiresAt: backup.expiresAt ? backup.expiresAt.toISOString() : null,
    restored: backup.restored,
    restoredAt: backup.restoredAt ? backup.restoredAt.toISOString() : null,
    restoredByUser: backup.restoredByUserId ? 'Utilisateur #' + backup.restoredByUserId : null
  };

  res.json(transformedBackup);
}));

router.post('/backups/create', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Simuler la création d'une sauvegarde (dans une vraie application, cela déclencherait un processus de sauvegarde)
  const now = new Date();
  const backupName = `backup_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

  // Récupérer la configuration de sauvegarde
  const config = await BackupConfig.findOne();

  // Calculer la date d'expiration
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + (config ? config.retention : 30));

  // Créer l'entrée de sauvegarde
  const backup = await Backup.create({
    name: backupName,
    timestamp: now,
    type: 'manual',
    size: Math.floor(Math.random() * 1024 * 1024 * 100), // Taille aléatoire pour la démo
    storageLocation: config ? config.storageType : 'local',
    localPath: `/var/backups/app/${backupName}.zip`,
    cloudPath: config && (config.storageType === 'cloud' || config.storageType === 'both') ? `s3://app-backups/manual/${backupName}.zip` : null,
    status: 'success',
    userId: userId || null,
    encrypted: config ? config.encryption : true,
    encryptionKeyId: config && config.encryption ? 'key-1' : null,
    content: JSON.stringify({
      tables: ['Users', 'Groups', 'Parameters', 'AuditLogs'],
      files: ['uploads', 'config']
    }),
    checksum: 'sha256:' + crypto.randomBytes(32).toString('hex'),
    expiresAt
  });

  // Mettre à jour la configuration de sauvegarde
  if (config) {
    config.lastBackup = now;
    await config.save();
  }

  // Transformer les données
  const transformedBackup = {
    id: backup.id.toString(),
    name: backup.name,
    timestamp: backup.timestamp.toISOString(),
    type: backup.type,
    size: formatFileSize(backup.size),
    storageLocation: backup.storageLocation,
    status: backup.status,
    user: userId ? 'Utilisateur #' + userId : 'Système',
    encrypted: backup.encrypted,
    expiresAt: backup.expiresAt.toISOString(),
    restored: backup.restored
  };

  res.status(201).json(transformedBackup);
}));

router.post('/backups/:id/restore', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const backup = await Backup.findByPk(req.params.id);
  if (!backup) {
    return res.status(404).json({ message: 'Sauvegarde non trouvée' });
  }

  // Vérifier si la sauvegarde est valide
  if (backup.status !== 'success') {
    return res.status(400).json({ message: 'Impossible de restaurer une sauvegarde qui n\'a pas réussi' });
  }

  // Simuler la restauration (dans une vraie application, cela déclencherait un processus de restauration)
  backup.restored = true;
  backup.restoredAt = new Date();
  backup.restoredByUserId = userId || null;
  await backup.save();

  // Transformer les données
  const transformedBackup = {
    id: backup.id.toString(),
    name: backup.name,
    timestamp: backup.timestamp.toISOString(),
    type: backup.type,
    size: formatFileSize(backup.size),
    storageLocation: backup.storageLocation,
    status: backup.status,
    user: backup.userId ? 'Utilisateur #' + backup.userId : 'Système',
    encrypted: backup.encrypted,
    expiresAt: backup.expiresAt ? backup.expiresAt.toISOString() : null,
    restored: backup.restored,
    restoredAt: backup.restoredAt.toISOString(),
    restoredByUser: userId ? 'Utilisateur #' + userId : 'Système'
  };

  res.json(transformedBackup);
}));

router.get('/backupconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration de sauvegarde (il ne devrait y avoir qu'une seule entrée)
  let config = await BackupConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await BackupConfig.create({
      frequency: 'daily',
      backupTime: '02:00',
      weeklyDay: 0, // Dimanche
      monthlyDay: 1, // Premier jour du mois
      retention: 30,
      storageType: 'both',
      localPath: '/var/backups/app',
      cloudConfig: JSON.stringify({
        provider: 'aws',
        bucket: 'app-backups',
        region: 'eu-west-1',
        prefix: 'daily/'
      }),
      encryption: true,
      encryptionKey: 'encrypted_key_placeholder',
      emailNotifications: true,
      notificationEmails: JSON.stringify(['admin@example.com'])
    });
  }

  // Calculer la prochaine sauvegarde
  let nextBackup = null;
  if (!config.nextBackup) {
    nextBackup = calculateNextBackup(config);
    config.nextBackup = nextBackup;
    await config.save();
  } else {
    nextBackup = config.nextBackup;
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    frequency: config.frequency,
    backupTime: config.backupTime,
    weeklyDay: config.weeklyDay,
    monthlyDay: config.monthlyDay,
    retention: config.retention,
    storageType: config.storageType,
    localPath: config.localPath,
    cloudConfig: config.cloudConfig,
    encryption: config.encryption,
    lastBackup: config.lastBackup ? config.lastBackup.toISOString() : null,
    nextBackup: config.nextBackup ? config.nextBackup.toISOString() : null,
    lastBackupStatus: config.lastBackupStatus,
    emailNotifications: config.emailNotifications,
    notificationEmails: config.notificationEmails
  };

  res.json(transformedConfig);
}));

router.put('/backupconfig', asyncHandler(async (req, res) => {
  const {
    frequency,
    backupTime,
    weeklyDay,
    monthlyDay,
    retention,
    storageType,
    localPath,
    cloudConfig,
    encryption,
    emailNotifications,
    notificationEmails
  } = req.body;

  // Récupérer la configuration de sauvegarde (il ne devrait y avoir qu'une seule entrée)
  let config = await BackupConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await BackupConfig.create({
      frequency: frequency || 'daily',
      backupTime: backupTime || '02:00',
      weeklyDay: weeklyDay !== undefined ? weeklyDay : 0,
      monthlyDay: monthlyDay !== undefined ? monthlyDay : 1,
      retention: retention || 30,
      storageType: storageType || 'both',
      localPath: localPath || '/var/backups/app',
      cloudConfig: cloudConfig || JSON.stringify({
        provider: 'aws',
        bucket: 'app-backups',
        region: 'eu-west-1',
        prefix: 'daily/'
      }),
      encryption: encryption !== undefined ? encryption : true,
      encryptionKey: 'encrypted_key_placeholder',
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      notificationEmails: notificationEmails || JSON.stringify(['admin@example.com'])
    });
  } else {
    // Mettre à jour les champs
    if (frequency) config.frequency = frequency;
    if (backupTime) config.backupTime = backupTime;
    if (weeklyDay !== undefined) config.weeklyDay = weeklyDay;
    if (monthlyDay !== undefined) config.monthlyDay = monthlyDay;
    if (retention !== undefined) config.retention = retention;
    if (storageType) config.storageType = storageType;
    if (localPath) config.localPath = localPath;
    if (cloudConfig) config.cloudConfig = cloudConfig;
    if (encryption !== undefined) config.encryption = encryption;
    if (emailNotifications !== undefined) config.emailNotifications = emailNotifications;
    if (notificationEmails) config.notificationEmails = notificationEmails;

    // Recalculer la prochaine sauvegarde
    config.nextBackup = calculateNextBackup(config);

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    frequency: config.frequency,
    backupTime: config.backupTime,
    weeklyDay: config.weeklyDay,
    monthlyDay: config.monthlyDay,
    retention: config.retention,
    storageType: config.storageType,
    localPath: config.localPath,
    cloudConfig: config.cloudConfig,
    encryption: config.encryption,
    lastBackup: config.lastBackup ? config.lastBackup.toISOString() : null,
    nextBackup: config.nextBackup ? config.nextBackup.toISOString() : null,
    lastBackupStatus: config.lastBackupStatus,
    emailNotifications: config.emailNotifications,
    notificationEmails: config.notificationEmails
  };

  res.json(transformedConfig);
}));

// Fonction utilitaire pour formater la taille des fichiers
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fonction utilitaire pour calculer la prochaine sauvegarde
function calculateNextBackup(config) {
  const now = new Date();
  const [hours, minutes] = config.backupTime.split(':').map(Number);

  let nextBackup = new Date(now);
  nextBackup.setHours(hours, minutes, 0, 0);

  // Si l'heure est déjà passée aujourd'hui, passer au jour suivant
  if (nextBackup <= now) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }

  // Ajuster en fonction de la fréquence
  if (config.frequency === 'weekly') {
    // Trouver le prochain jour de la semaine correspondant
    const currentDay = nextBackup.getDay();
    const daysToAdd = (config.weeklyDay - currentDay + 7) % 7;

    if (daysToAdd > 0 || (daysToAdd === 0 && nextBackup <= now)) {
      nextBackup.setDate(nextBackup.getDate() + daysToAdd);
    }
  } else if (config.frequency === 'monthly') {
    // Trouver le prochain jour du mois correspondant
    const currentDate = nextBackup.getDate();

    if (currentDate > config.monthlyDay || (currentDate === config.monthlyDay && nextBackup <= now)) {
      // Passer au mois suivant
      nextBackup.setMonth(nextBackup.getMonth() + 1);
    }

    // Définir le jour du mois
    nextBackup.setDate(config.monthlyDay);

    // Vérifier si le jour existe dans le mois (par exemple, le 31 février n'existe pas)
    const month = nextBackup.getMonth();
    nextBackup.setDate(config.monthlyDay);

    // Si le mois a changé, c'est que le jour n'existe pas dans ce mois
    if (nextBackup.getMonth() !== month) {
      // Revenir au dernier jour du mois précédent
      nextBackup = new Date(nextBackup.getFullYear(), month + 1, 0, hours, minutes, 0, 0);
    }
  }

  return nextBackup;
}

// Routes pour la catégorie "Apparences"
router.get('/themeconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration du thème (il ne devrait y avoir qu'une seule entrée)
  let config = await ThemeConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ThemeConfig.create({
      mode: 'light',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      density: 'normal',
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      dashboardLayout: 'default'
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    mode: config.mode,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    density: config.density,
    fontSize: config.fontSize,
    highContrast: config.highContrast,
    reducedMotion: config.reducedMotion,
    dashboardLayout: config.dashboardLayout,
    customCSS: config.customCSS,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.put('/themeconfig', asyncHandler(async (req, res) => {
  const {
    mode,
    primaryColor,
    secondaryColor,
    density,
    fontSize,
    highContrast,
    reducedMotion,
    dashboardLayout,
    customCSS,
    advancedSettings
  } = req.body;

  // Récupérer la configuration du thème (il ne devrait y avoir qu'une seule entrée)
  let config = await ThemeConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ThemeConfig.create({
      mode: mode || 'light',
      primaryColor: primaryColor || '#3b82f6',
      secondaryColor: secondaryColor || '#10b981',
      density: density || 'normal',
      fontSize: fontSize || 'medium',
      highContrast: highContrast !== undefined ? highContrast : false,
      reducedMotion: reducedMotion !== undefined ? reducedMotion : false,
      dashboardLayout: dashboardLayout || 'default',
      customCSS: customCSS || null,
      advancedSettings: advancedSettings || null
    });
  } else {
    // Mettre à jour les champs
    if (mode) config.mode = mode;
    if (primaryColor) config.primaryColor = primaryColor;
    if (secondaryColor !== undefined) config.secondaryColor = secondaryColor;
    if (density) config.density = density;
    if (fontSize) config.fontSize = fontSize;
    if (highContrast !== undefined) config.highContrast = highContrast;
    if (reducedMotion !== undefined) config.reducedMotion = reducedMotion;
    if (dashboardLayout) config.dashboardLayout = dashboardLayout;
    if (customCSS !== undefined) config.customCSS = customCSS;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    mode: config.mode,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    density: config.density,
    fontSize: config.fontSize,
    highContrast: config.highContrast,
    reducedMotion: config.reducedMotion,
    dashboardLayout: config.dashboardLayout,
    customCSS: config.customCSS,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.get('/customlogos', asyncHandler(async (req, res) => {
  const logos = await CustomLogo.findAll({
    where: { active: true },
    order: [['type', 'ASC']]
  });

  // Transformer les données
  const transformedLogos = logos.map(logo => ({
    id: logo.id.toString(),
    type: logo.type,
    filePath: logo.filePath,
    originalFilename: logo.originalFilename,
    mimeType: logo.mimeType,
    fileSize: logo.fileSize,
    dimensions: logo.dimensions,
    active: logo.active,
    metadata: logo.metadata
  }));

  res.json(transformedLogos);
}));

router.get('/customlogos/:type', asyncHandler(async (req, res) => {
  const logo = await CustomLogo.findOne({
    where: {
      type: req.params.type,
      active: true
    }
  });

  if (!logo) {
    return res.status(404).json({ message: 'Logo non trouvé' });
  }

  // Transformer les données
  const transformedLogo = {
    id: logo.id.toString(),
    type: logo.type,
    filePath: logo.filePath,
    originalFilename: logo.originalFilename,
    mimeType: logo.mimeType,
    fileSize: logo.fileSize,
    dimensions: logo.dimensions,
    active: logo.active,
    metadata: logo.metadata
  };

  res.json(transformedLogo);
}));

// Routes pour la catégorie "Import/export"
router.get('/importconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration d'import (il ne devrait y avoir qu'une seule entrée)
  let config = await ImportConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ImportConfig.create({
      allowedFormats: ['csv', 'xlsx', 'xml', 'json'],
      maxFileSize: 10485760, // 10 MB
      defaultDelimiter: ',',
      defaultEncoding: 'UTF-8',
      validateBeforeImport: true,
      ignoreErrors: false,
      emailNotifications: true
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    allowedFormats: config.allowedFormats,
    maxFileSize: config.maxFileSize,
    defaultDelimiter: config.defaultDelimiter,
    defaultEncoding: config.defaultEncoding,
    validateBeforeImport: config.validateBeforeImport,
    ignoreErrors: config.ignoreErrors,
    maxRows: config.maxRows,
    tempDirectory: config.tempDirectory,
    emailNotifications: config.emailNotifications,
    notificationEmails: config.notificationEmails,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.put('/importconfig', asyncHandler(async (req, res) => {
  const {
    allowedFormats,
    maxFileSize,
    defaultDelimiter,
    defaultEncoding,
    validateBeforeImport,
    ignoreErrors,
    maxRows,
    tempDirectory,
    emailNotifications,
    notificationEmails,
    advancedSettings
  } = req.body;

  // Récupérer la configuration d'import (il ne devrait y avoir qu'une seule entrée)
  let config = await ImportConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ImportConfig.create({
      allowedFormats: allowedFormats || ['csv', 'xlsx', 'xml', 'json'],
      maxFileSize: maxFileSize || 10485760,
      defaultDelimiter: defaultDelimiter || ',',
      defaultEncoding: defaultEncoding || 'UTF-8',
      validateBeforeImport: validateBeforeImport !== undefined ? validateBeforeImport : true,
      ignoreErrors: ignoreErrors !== undefined ? ignoreErrors : false,
      maxRows: maxRows || null,
      tempDirectory: tempDirectory || '/tmp/imports',
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      notificationEmails: notificationEmails || null,
      advancedSettings: advancedSettings || null
    });
  } else {
    // Mettre à jour les champs
    if (allowedFormats) config.allowedFormats = allowedFormats;
    if (maxFileSize !== undefined) config.maxFileSize = maxFileSize;
    if (defaultDelimiter) config.defaultDelimiter = defaultDelimiter;
    if (defaultEncoding) config.defaultEncoding = defaultEncoding;
    if (validateBeforeImport !== undefined) config.validateBeforeImport = validateBeforeImport;
    if (ignoreErrors !== undefined) config.ignoreErrors = ignoreErrors;
    if (maxRows !== undefined) config.maxRows = maxRows;
    if (tempDirectory) config.tempDirectory = tempDirectory;
    if (emailNotifications !== undefined) config.emailNotifications = emailNotifications;
    if (notificationEmails !== undefined) config.notificationEmails = notificationEmails;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    allowedFormats: config.allowedFormats,
    maxFileSize: config.maxFileSize,
    defaultDelimiter: config.defaultDelimiter,
    defaultEncoding: config.defaultEncoding,
    validateBeforeImport: config.validateBeforeImport,
    ignoreErrors: config.ignoreErrors,
    maxRows: config.maxRows,
    tempDirectory: config.tempDirectory,
    emailNotifications: config.emailNotifications,
    notificationEmails: config.notificationEmails,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.get('/exportconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration d'export (il ne devrait y avoir qu'une seule entrée)
  let config = await ExportConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ExportConfig.create({
      availableFormats: ['csv', 'xlsx', 'xml', 'json', 'pdf'],
      defaultFormat: 'xlsx',
      defaultDelimiter: ',',
      defaultEncoding: 'UTF-8',
      includeHeaders: true,
      compressExports: true,
      emailNotifications: true
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    availableFormats: config.availableFormats,
    defaultFormat: config.defaultFormat,
    defaultDelimiter: config.defaultDelimiter,
    defaultEncoding: config.defaultEncoding,
    includeHeaders: config.includeHeaders,
    maxRows: config.maxRows,
    tempDirectory: config.tempDirectory,
    compressExports: config.compressExports,
    dateFormat: config.dateFormat,
    emailNotifications: config.emailNotifications,
    notificationEmails: config.notificationEmails,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.put('/exportconfig', asyncHandler(async (req, res) => {
  const {
    availableFormats,
    defaultFormat,
    defaultDelimiter,
    defaultEncoding,
    includeHeaders,
    maxRows,
    tempDirectory,
    compressExports,
    dateFormat,
    emailNotifications,
    notificationEmails,
    advancedSettings
  } = req.body;

  // Récupérer la configuration d'export (il ne devrait y avoir qu'une seule entrée)
  let config = await ExportConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ExportConfig.create({
      availableFormats: availableFormats || ['csv', 'xlsx', 'xml', 'json', 'pdf'],
      defaultFormat: defaultFormat || 'xlsx',
      defaultDelimiter: defaultDelimiter || ',',
      defaultEncoding: defaultEncoding || 'UTF-8',
      includeHeaders: includeHeaders !== undefined ? includeHeaders : true,
      maxRows: maxRows || 100000,
      tempDirectory: tempDirectory || '/tmp/exports',
      compressExports: compressExports !== undefined ? compressExports : true,
      dateFormat: dateFormat || 'YYYY-MM-DD',
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      notificationEmails: notificationEmails || null,
      advancedSettings: advancedSettings || null
    });
  } else {
    // Mettre à jour les champs
    if (availableFormats) config.availableFormats = availableFormats;
    if (defaultFormat) config.defaultFormat = defaultFormat;
    if (defaultDelimiter) config.defaultDelimiter = defaultDelimiter;
    if (defaultEncoding) config.defaultEncoding = defaultEncoding;
    if (includeHeaders !== undefined) config.includeHeaders = includeHeaders;
    if (maxRows !== undefined) config.maxRows = maxRows;
    if (tempDirectory) config.tempDirectory = tempDirectory;
    if (compressExports !== undefined) config.compressExports = compressExports;
    if (dateFormat) config.dateFormat = dateFormat;
    if (emailNotifications !== undefined) config.emailNotifications = emailNotifications;
    if (notificationEmails !== undefined) config.notificationEmails = notificationEmails;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    availableFormats: config.availableFormats,
    defaultFormat: config.defaultFormat,
    defaultDelimiter: config.defaultDelimiter,
    defaultEncoding: config.defaultEncoding,
    includeHeaders: config.includeHeaders,
    maxRows: config.maxRows,
    tempDirectory: config.tempDirectory,
    compressExports: config.compressExports,
    dateFormat: config.dateFormat,
    emailNotifications: config.emailNotifications,
    notificationEmails: config.notificationEmails,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.get('/importexporthistory', asyncHandler(async (req, res) => {
  const history = await ImportExportHistory.findAll({
    include: [{ model: User, as: 'user' }],
    order: [['timestamp', 'DESC']],
    limit: 100
  });

  // Transformer les données
  const transformedHistory = history.map(entry => ({
    id: entry.id.toString(),
    operationType: entry.operationType,
    timestamp: entry.timestamp.toISOString(),
    user: entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'Système',
    dataType: entry.dataType,
    fileFormat: entry.fileFormat,
    fileName: entry.fileName,
    fileSize: formatFileSize(entry.fileSize),
    recordCount: entry.recordCount,
    status: entry.status,
    errorDetails: entry.errorDetails,
    duration: entry.duration,
    filePath: entry.filePath,
    expiresAt: entry.expiresAt ? entry.expiresAt.toISOString() : null
  }));

  res.json(transformedHistory);
}));

// Routes pour la catégorie "Conformité"
router.get('/complianceconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration de conformité (il ne devrait y avoir qu'une seule entrée)
  let config = await ComplianceConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ComplianceConfig.create({
      gdprEnabled: true,
      dataRetentionPeriod: 730, // 2 ans
      anonymizeAfterRetention: true,
      requireConsent: true,
      logSensitiveDataAccess: true,
      encryptSensitiveData: true,
      dataBreachNotification: true,
      hipaaCompliance: false,
      pciDssCompliance: false,
      soxCompliance: false
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    gdprEnabled: config.gdprEnabled,
    dataRetentionPeriod: config.dataRetentionPeriod,
    anonymizeAfterRetention: config.anonymizeAfterRetention,
    requireConsent: config.requireConsent,
    consentText: config.consentText,
    privacyPolicyUrl: config.privacyPolicyUrl,
    logSensitiveDataAccess: config.logSensitiveDataAccess,
    encryptSensitiveData: config.encryptSensitiveData,
    dataBreachNotification: config.dataBreachNotification,
    dataBreachEmails: config.dataBreachEmails,
    hipaaCompliance: config.hipaaCompliance,
    pciDssCompliance: config.pciDssCompliance,
    soxCompliance: config.soxCompliance,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.put('/complianceconfig', asyncHandler(async (req, res) => {
  const {
    gdprEnabled,
    dataRetentionPeriod,
    anonymizeAfterRetention,
    requireConsent,
    consentText,
    privacyPolicyUrl,
    logSensitiveDataAccess,
    encryptSensitiveData,
    dataBreachNotification,
    dataBreachEmails,
    hipaaCompliance,
    pciDssCompliance,
    soxCompliance,
    advancedSettings
  } = req.body;

  // Récupérer la configuration de conformité (il ne devrait y avoir qu'une seule entrée)
  let config = await ComplianceConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await ComplianceConfig.create({
      gdprEnabled: gdprEnabled !== undefined ? gdprEnabled : true,
      dataRetentionPeriod: dataRetentionPeriod || 730,
      anonymizeAfterRetention: anonymizeAfterRetention !== undefined ? anonymizeAfterRetention : true,
      requireConsent: requireConsent !== undefined ? requireConsent : true,
      consentText: consentText || null,
      privacyPolicyUrl: privacyPolicyUrl || null,
      logSensitiveDataAccess: logSensitiveDataAccess !== undefined ? logSensitiveDataAccess : true,
      encryptSensitiveData: encryptSensitiveData !== undefined ? encryptSensitiveData : true,
      dataBreachNotification: dataBreachNotification !== undefined ? dataBreachNotification : true,
      dataBreachEmails: dataBreachEmails || null,
      hipaaCompliance: hipaaCompliance !== undefined ? hipaaCompliance : false,
      pciDssCompliance: pciDssCompliance !== undefined ? pciDssCompliance : false,
      soxCompliance: soxCompliance !== undefined ? soxCompliance : false,
      advancedSettings: advancedSettings || null
    });
  } else {
    // Mettre à jour les champs
    if (gdprEnabled !== undefined) config.gdprEnabled = gdprEnabled;
    if (dataRetentionPeriod !== undefined) config.dataRetentionPeriod = dataRetentionPeriod;
    if (anonymizeAfterRetention !== undefined) config.anonymizeAfterRetention = anonymizeAfterRetention;
    if (requireConsent !== undefined) config.requireConsent = requireConsent;
    if (consentText !== undefined) config.consentText = consentText;
    if (privacyPolicyUrl !== undefined) config.privacyPolicyUrl = privacyPolicyUrl;
    if (logSensitiveDataAccess !== undefined) config.logSensitiveDataAccess = logSensitiveDataAccess;
    if (encryptSensitiveData !== undefined) config.encryptSensitiveData = encryptSensitiveData;
    if (dataBreachNotification !== undefined) config.dataBreachNotification = dataBreachNotification;
    if (dataBreachEmails !== undefined) config.dataBreachEmails = dataBreachEmails;
    if (hipaaCompliance !== undefined) config.hipaaCompliance = hipaaCompliance;
    if (pciDssCompliance !== undefined) config.pciDssCompliance = pciDssCompliance;
    if (soxCompliance !== undefined) config.soxCompliance = soxCompliance;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    gdprEnabled: config.gdprEnabled,
    dataRetentionPeriod: config.dataRetentionPeriod,
    anonymizeAfterRetention: config.anonymizeAfterRetention,
    requireConsent: config.requireConsent,
    consentText: config.consentText,
    privacyPolicyUrl: config.privacyPolicyUrl,
    logSensitiveDataAccess: config.logSensitiveDataAccess,
    encryptSensitiveData: config.encryptSensitiveData,
    dataBreachNotification: config.dataBreachNotification,
    dataBreachEmails: config.dataBreachEmails,
    hipaaCompliance: config.hipaaCompliance,
    pciDssCompliance: config.pciDssCompliance,
    soxCompliance: config.soxCompliance,
    advancedSettings: config.advancedSettings
  };

  res.json(transformedConfig);
}));

router.get('/consentrecords', asyncHandler(async (req, res) => {
  const { userId, consentType } = req.query;

  const whereClause = {};

  if (userId) whereClause.userId = userId;
  if (consentType) whereClause.consentType = consentType;

  const records = await ConsentRecord.findAll({
    where: whereClause,
    include: [{ model: User, as: 'user' }],
    order: [['consentDate', 'DESC']]
  });

  // Transformer les données
  const transformedRecords = records.map(record => ({
    id: record.id.toString(),
    userId: record.userId.toString(),
    user: record.user ? `${record.user.firstName} ${record.user.lastName}` : 'Inconnu',
    consentType: record.consentType,
    consentDate: record.consentDate.toISOString(),
    consentValue: record.consentValue,
    policyVersion: record.policyVersion,
    ipAddress: record.ipAddress,
    collectionMethod: record.collectionMethod,
    expiryDate: record.expiryDate ? record.expiryDate.toISOString() : null
  }));

  res.json(transformedRecords);
}));

router.post('/consentrecords', asyncHandler(async (req, res) => {
  const {
    userId,
    consentType,
    consentValue,
    policyVersion,
    ipAddress,
    userAgent,
    collectionMethod,
    consentText,
    expiryDate,
    metadata
  } = req.body;

  // Vérifier que l'utilisateur existe
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }

  // Créer l'enregistrement de consentement
  const record = await ConsentRecord.create({
    userId,
    consentType,
    consentValue,
    policyVersion,
    ipAddress,
    userAgent,
    collectionMethod,
    consentText,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    metadata
  });

  // Transformer les données
  const transformedRecord = {
    id: record.id.toString(),
    userId: record.userId.toString(),
    consentType: record.consentType,
    consentDate: record.consentDate.toISOString(),
    consentValue: record.consentValue,
    policyVersion: record.policyVersion,
    ipAddress: record.ipAddress,
    collectionMethod: record.collectionMethod,
    expiryDate: record.expiryDate ? record.expiryDate.toISOString() : null
  };

  res.status(201).json(transformedRecord);
}));

// Routes pour la catégorie "Calendrier"
router.get('/calendarconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration du calendrier (il ne devrait y avoir qu'une seule entrée)
  let config = await CalendarConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await CalendarConfig.create({
      timezone: 'Europe/Paris',
      workHoursStart: '08:00',
      workHoursEnd: '18:00',
      weekStart: 'monday',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      advancedSettings: {
        showWeekNumbers: true,
        firstDayOfYear: 1,
        minimalDaysInFirstWeek: 4,
        workWeekStart: 1,
        workWeekEnd: 5,
        defaultView: 'month',
        defaultDuration: 60,
        slotDuration: 30,
        snapDuration: 15
      }
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    timezone: config.timezone,
    workHoursStart: config.workHoursStart,
    workHoursEnd: config.workHoursEnd,
    weekStart: config.weekStart,
    dateFormat: config.dateFormat,
    timeFormat: config.timeFormat,
    workDays: config.workDays,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.put('/calendarconfig', asyncHandler(async (req, res) => {
  const {
    timezone,
    workHoursStart,
    workHoursEnd,
    weekStart,
    dateFormat,
    timeFormat,
    workDays,
    advancedSettings
  } = req.body;

  // Récupérer la configuration du calendrier (il ne devrait y avoir qu'une seule entrée)
  let config = await CalendarConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await CalendarConfig.create({
      timezone: timezone || 'Europe/Paris',
      workHoursStart: workHoursStart || '08:00',
      workHoursEnd: workHoursEnd || '18:00',
      weekStart: weekStart || 'monday',
      dateFormat: dateFormat || 'YYYY-MM-DD',
      timeFormat: timeFormat || 'HH:mm',
      workDays: workDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      advancedSettings: advancedSettings || {}
    });
  } else {
    // Mettre à jour les champs
    if (timezone !== undefined) config.timezone = timezone;
    if (workHoursStart !== undefined) config.workHoursStart = workHoursStart;
    if (workHoursEnd !== undefined) config.workHoursEnd = workHoursEnd;
    if (weekStart !== undefined) config.weekStart = weekStart;
    if (dateFormat !== undefined) config.dateFormat = dateFormat;
    if (timeFormat !== undefined) config.timeFormat = timeFormat;
    if (workDays !== undefined) config.workDays = workDays;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    timezone: config.timezone,
    workHoursStart: config.workHoursStart,
    workHoursEnd: config.workHoursEnd,
    weekStart: config.weekStart,
    dateFormat: config.dateFormat,
    timeFormat: config.timeFormat,
    workDays: config.workDays,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.get('/holidays', asyncHandler(async (req, res) => {
  const holidays = await Holiday.findAll({
    order: [['date', 'ASC']]
  });

  // Transformer les données
  const transformedHolidays = holidays.map(holiday => ({
    id: holiday.id.toString(),
    name: holiday.name,
    date: holiday.date,
    country: holiday.country,
    recurring: holiday.recurring,
    type: holiday.type,
    description: holiday.description || '',
    active: holiday.active
  }));

  res.json(transformedHolidays);
}));

router.post('/holidays', asyncHandler(async (req, res) => {
  const {
    name,
    date,
    country,
    recurring,
    type,
    description,
    active
  } = req.body;

  // Vérifier les données requises
  if (!name || !date) {
    return res.status(400).json({ message: 'Les champs name et date sont requis' });
  }

  // Créer le jour férié
  const holiday = await Holiday.create({
    name,
    date,
    country: country || 'France',
    recurring: recurring !== undefined ? recurring : true,
    type: type || 'national',
    description,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedHoliday = {
    id: holiday.id.toString(),
    name: holiday.name,
    date: holiday.date,
    country: holiday.country,
    recurring: holiday.recurring,
    type: holiday.type,
    description: holiday.description || '',
    active: holiday.active
  };

  res.status(201).json(transformedHoliday);
}));

router.put('/holidays/:id', asyncHandler(async (req, res) => {
  const {
    name,
    date,
    country,
    recurring,
    type,
    description,
    active
  } = req.body;

  // Vérifier les données requises
  if (!name || !date) {
    return res.status(400).json({ message: 'Les champs name et date sont requis' });
  }

  const holiday = await Holiday.findByPk(req.params.id);
  if (!holiday) {
    return res.status(404).json({ message: 'Jour férié non trouvé' });
  }

  // Mettre à jour le jour férié
  await holiday.update({
    name,
    date,
    country: country || holiday.country,
    recurring: recurring !== undefined ? recurring : holiday.recurring,
    type: type || holiday.type,
    description: description !== undefined ? description : holiday.description,
    active: active !== undefined ? active : holiday.active
  });

  // Transformer les données
  const transformedHoliday = {
    id: holiday.id.toString(),
    name: holiday.name,
    date: holiday.date,
    country: holiday.country,
    recurring: holiday.recurring,
    type: holiday.type,
    description: holiday.description || '',
    active: holiday.active
  };

  res.json(transformedHoliday);
}));

router.delete('/holidays/:id', asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByPk(req.params.id);
  if (!holiday) {
    return res.status(404).json({ message: 'Jour férié non trouvé' });
  }

  await holiday.destroy();
  res.status(204).end();
}));

router.get('/calendarintegrations', asyncHandler(async (req, res) => {
  const integrations = await CalendarIntegration.findAll({
    include: [{ model: User, as: 'user' }],
    order: [['type', 'ASC']]
  });

  // Transformer les données
  const transformedIntegrations = integrations.map(integration => ({
    id: integration.id.toString(),
    type: integration.type,
    name: integration.name,
    userId: integration.userId ? integration.userId.toString() : null,
    userName: integration.user ? `${integration.user.firstName} ${integration.user.lastName}` : null,
    lastSync: integration.lastSync ? integration.lastSync.toISOString() : null,
    lastSyncStatus: integration.lastSyncStatus,
    active: integration.active
  }));

  res.json(transformedIntegrations);
}));

// Routes pour la catégorie "Numérotation"
router.get('/sequenceconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration des séquences (il ne devrait y avoir qu'une seule entrée)
  let config = await SequenceConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await SequenceConfig.create({
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
      defaultFormat: 'prefix-number-year',
      defaultPadding: 5,
      autoReset: true,
      advancedSettings: {
        yearFormat: 'YY',
        separator: '-',
        allowCustomFormat: true,
        allowManualReset: true,
        allowManualNumbering: false,
        enforceUniqueness: true,
        lockSequenceAfterUse: true
      }
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    fiscalYearStart: config.fiscalYearStart,
    fiscalYearEnd: config.fiscalYearEnd,
    defaultFormat: config.defaultFormat,
    defaultPadding: config.defaultPadding,
    autoReset: config.autoReset,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.put('/sequenceconfig', asyncHandler(async (req, res) => {
  const {
    fiscalYearStart,
    fiscalYearEnd,
    defaultFormat,
    defaultPadding,
    autoReset,
    advancedSettings
  } = req.body;

  // Récupérer la configuration des séquences (il ne devrait y avoir qu'une seule entrée)
  let config = await SequenceConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await SequenceConfig.create({
      fiscalYearStart: fiscalYearStart || '01-01',
      fiscalYearEnd: fiscalYearEnd || '12-31',
      defaultFormat: defaultFormat || 'prefix-number-year',
      defaultPadding: defaultPadding || 5,
      autoReset: autoReset !== undefined ? autoReset : true,
      advancedSettings: advancedSettings || {}
    });
  } else {
    // Mettre à jour les champs
    if (fiscalYearStart !== undefined) config.fiscalYearStart = fiscalYearStart;
    if (fiscalYearEnd !== undefined) config.fiscalYearEnd = fiscalYearEnd;
    if (defaultFormat !== undefined) config.defaultFormat = defaultFormat;
    if (defaultPadding !== undefined) config.defaultPadding = defaultPadding;
    if (autoReset !== undefined) config.autoReset = autoReset;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    fiscalYearStart: config.fiscalYearStart,
    fiscalYearEnd: config.fiscalYearEnd,
    defaultFormat: config.defaultFormat,
    defaultPadding: config.defaultPadding,
    autoReset: config.autoReset,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.get('/sequences', asyncHandler(async (req, res) => {
  const sequences = await Sequence.findAll({
    order: [['documentType', 'ASC'], ['name', 'ASC']]
  });

  // Transformer les données
  const transformedSequences = sequences.map(sequence => ({
    id: sequence.id.toString(),
    name: sequence.name,
    prefix: sequence.prefix || '',
    suffix: sequence.suffix || '',
    nextNumber: sequence.nextNumber,
    padding: sequence.padding,
    resetFrequency: sequence.resetFrequency,
    documentType: sequence.documentType,
    lastReset: sequence.lastReset ? sequence.lastReset.toISOString() : null,
    active: sequence.active
  }));

  res.json(transformedSequences);
}));

router.post('/sequences', asyncHandler(async (req, res) => {
  const {
    name,
    prefix,
    suffix,
    nextNumber,
    padding,
    resetFrequency,
    documentType,
    active
  } = req.body;

  // Vérifier les données requises
  if (!name || !documentType) {
    return res.status(400).json({ message: 'Les champs name et documentType sont requis' });
  }

  // Vérifier si une séquence existe déjà pour ce type de document
  const existingSequence = await Sequence.findOne({
    where: { documentType }
  });

  if (existingSequence) {
    return res.status(400).json({ message: `Une séquence existe déjà pour le type de document ${documentType}` });
  }

  // Créer la séquence
  const sequence = await Sequence.create({
    name,
    prefix: prefix || '',
    suffix: suffix || '',
    nextNumber: nextNumber || 1,
    padding: padding || 5,
    resetFrequency: resetFrequency || 'never',
    documentType,
    lastReset: resetFrequency !== 'never' ? new Date() : null,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedSequence = {
    id: sequence.id.toString(),
    name: sequence.name,
    prefix: sequence.prefix || '',
    suffix: sequence.suffix || '',
    nextNumber: sequence.nextNumber,
    padding: sequence.padding,
    resetFrequency: sequence.resetFrequency,
    documentType: sequence.documentType,
    lastReset: sequence.lastReset ? sequence.lastReset.toISOString() : null,
    active: sequence.active
  };

  res.status(201).json(transformedSequence);
}));

router.put('/sequences/:id', asyncHandler(async (req, res) => {
  const {
    name,
    prefix,
    suffix,
    nextNumber,
    padding,
    resetFrequency,
    documentType,
    active
  } = req.body;

  // Vérifier les données requises
  if (!name || !documentType) {
    return res.status(400).json({ message: 'Les champs name et documentType sont requis' });
  }

  const sequence = await Sequence.findByPk(req.params.id);
  if (!sequence) {
    return res.status(404).json({ message: 'Séquence non trouvée' });
  }

  // Si le type de document a changé, vérifier qu'il n'existe pas déjà une séquence pour ce type
  if (documentType !== sequence.documentType) {
    const existingSequence = await Sequence.findOne({
      where: { documentType }
    });

    if (existingSequence && existingSequence.id !== parseInt(req.params.id)) {
      return res.status(400).json({ message: `Une séquence existe déjà pour le type de document ${documentType}` });
    }
  }

  // Mettre à jour la séquence
  await sequence.update({
    name,
    prefix: prefix !== undefined ? prefix : sequence.prefix,
    suffix: suffix !== undefined ? suffix : sequence.suffix,
    nextNumber: nextNumber || sequence.nextNumber,
    padding: padding || sequence.padding,
    resetFrequency: resetFrequency || sequence.resetFrequency,
    documentType,
    active: active !== undefined ? active : sequence.active
  });

  // Transformer les données
  const transformedSequence = {
    id: sequence.id.toString(),
    name: sequence.name,
    prefix: sequence.prefix || '',
    suffix: sequence.suffix || '',
    nextNumber: sequence.nextNumber,
    padding: sequence.padding,
    resetFrequency: sequence.resetFrequency,
    documentType: sequence.documentType,
    lastReset: sequence.lastReset ? sequence.lastReset.toISOString() : null,
    active: sequence.active
  };

  res.json(transformedSequence);
}));

router.delete('/sequences/:id', asyncHandler(async (req, res) => {
  const sequence = await Sequence.findByPk(req.params.id);
  if (!sequence) {
    return res.status(404).json({ message: 'Séquence non trouvée' });
  }

  await sequence.destroy();
  res.status(204).end();
}));

router.post('/sequences/:id/reset', asyncHandler(async (req, res) => {
  const sequence = await Sequence.findByPk(req.params.id);
  if (!sequence) {
    return res.status(404).json({ message: 'Séquence non trouvée' });
  }

  // Réinitialiser la séquence
  await sequence.update({
    nextNumber: 1,
    lastReset: new Date()
  });

  // Transformer les données
  const transformedSequence = {
    id: sequence.id.toString(),
    name: sequence.name,
    prefix: sequence.prefix || '',
    suffix: sequence.suffix || '',
    nextNumber: sequence.nextNumber,
    padding: sequence.padding,
    resetFrequency: sequence.resetFrequency,
    documentType: sequence.documentType,
    lastReset: sequence.lastReset ? sequence.lastReset.toISOString() : null,
    active: sequence.active
  };

  res.json(transformedSequence);
}));

// Routes pour la catégorie "Performance"
router.get('/performanceconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration des performances (il ne devrait y avoir qu'une seule entrée)
  let config = await PerformanceConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await PerformanceConfig.create({
      cacheEnabled: true,
      cacheSize: 500,
      cacheTTL: 3600,
      defaultPageSize: 25,
      queryOptimization: true,
      responseCompression: true,
      loggingLevel: 'info',
      requestTimeout: 30,
      maxDbConnections: 10,
      advancedSettings: {
        minifyAssets: true,
        useEtags: true,
        gzipCompression: true,
        staticCacheMaxAge: 86400,
        apiRateLimit: 100,
        apiRateLimitWindow: 60,
        dbPoolIdleTimeout: 10000,
        dbPoolAcquireTimeout: 60000,
        dbPoolMaxUsage: 10,
        dbSlowQueryThreshold: 1000,
        memoryWatchEnabled: true,
        memoryWatchThreshold: 80,
        cpuWatchEnabled: true,
        cpuWatchThreshold: 70
      }
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    cacheEnabled: config.cacheEnabled,
    cacheSize: config.cacheSize,
    cacheTTL: config.cacheTTL,
    defaultPageSize: config.defaultPageSize,
    queryOptimization: config.queryOptimization,
    responseCompression: config.responseCompression,
    loggingLevel: config.loggingLevel,
    requestTimeout: config.requestTimeout,
    maxDbConnections: config.maxDbConnections,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.put('/performanceconfig', asyncHandler(async (req, res) => {
  const {
    cacheEnabled,
    cacheSize,
    cacheTTL,
    defaultPageSize,
    queryOptimization,
    responseCompression,
    loggingLevel,
    requestTimeout,
    maxDbConnections,
    advancedSettings
  } = req.body;

  // Récupérer la configuration des performances (il ne devrait y avoir qu'une seule entrée)
  let config = await PerformanceConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await PerformanceConfig.create({
      cacheEnabled: cacheEnabled !== undefined ? cacheEnabled : true,
      cacheSize: cacheSize || 500,
      cacheTTL: cacheTTL || 3600,
      defaultPageSize: defaultPageSize || 25,
      queryOptimization: queryOptimization !== undefined ? queryOptimization : true,
      responseCompression: responseCompression !== undefined ? responseCompression : true,
      loggingLevel: loggingLevel || 'info',
      requestTimeout: requestTimeout || 30,
      maxDbConnections: maxDbConnections || 10,
      advancedSettings: advancedSettings || {}
    });
  } else {
    // Mettre à jour les champs
    if (cacheEnabled !== undefined) config.cacheEnabled = cacheEnabled;
    if (cacheSize !== undefined) config.cacheSize = cacheSize;
    if (cacheTTL !== undefined) config.cacheTTL = cacheTTL;
    if (defaultPageSize !== undefined) config.defaultPageSize = defaultPageSize;
    if (queryOptimization !== undefined) config.queryOptimization = queryOptimization;
    if (responseCompression !== undefined) config.responseCompression = responseCompression;
    if (loggingLevel !== undefined) config.loggingLevel = loggingLevel;
    if (requestTimeout !== undefined) config.requestTimeout = requestTimeout;
    if (maxDbConnections !== undefined) config.maxDbConnections = maxDbConnections;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    cacheEnabled: config.cacheEnabled,
    cacheSize: config.cacheSize,
    cacheTTL: config.cacheTTL,
    defaultPageSize: config.defaultPageSize,
    queryOptimization: config.queryOptimization,
    responseCompression: config.responseCompression,
    loggingLevel: config.loggingLevel,
    requestTimeout: config.requestTimeout,
    maxDbConnections: config.maxDbConnections,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.get('/performancemetrics', asyncHandler(async (req, res) => {
  // Simuler des métriques de performance (dans une vraie application, ces données proviendraient de moniteurs système)
  const metrics = {
    cpu: {
      usage: Math.floor(Math.random() * 100),
      cores: 4,
      load: [Math.random() * 2, Math.random() * 1.5, Math.random() * 1]
    },
    memory: {
      total: 8192, // MB
      used: Math.floor(Math.random() * 4096) + 2048, // MB
      free: Math.floor(Math.random() * 2048), // MB
      usage: Math.floor(Math.random() * 100)
    },
    disk: {
      total: 100, // GB
      used: Math.floor(Math.random() * 50) + 30, // GB
      free: Math.floor(Math.random() * 20), // GB
      usage: Math.floor(Math.random() * 100)
    },
    network: {
      inbound: Math.floor(Math.random() * 1000), // KB/s
      outbound: Math.floor(Math.random() * 500), // KB/s
      connections: Math.floor(Math.random() * 100)
    },
    database: {
      connections: Math.floor(Math.random() * 20),
      queryTime: Math.floor(Math.random() * 200), // ms
      slowQueries: Math.floor(Math.random() * 5)
    },
    api: {
      requests: Math.floor(Math.random() * 1000),
      responseTime: Math.floor(Math.random() * 300), // ms
      errors: Math.floor(Math.random() * 10)
    },
    timestamp: new Date().toISOString()
  };

  res.json(metrics);
}));

// Routes pour la catégorie "Notifications"
// 1. Routes pour les canaux de notification
router.get('/notificationchannels', asyncHandler(async (req, res) => {
  const channels = await NotificationChannel.findAll({
    order: [['displayOrder', 'ASC']]
  });

  // Transformer les données
  const transformedChannels = channels.map(channel => ({
    id: channel.id.toString(),
    name: channel.name,
    type: channel.type,
    description: channel.description || '',
    config: channel.config || {},
    enabled: channel.enabled,
    displayOrder: channel.displayOrder,
    icon: channel.icon || channel.type // Utiliser le type comme icône par défaut
  }));

  res.json(transformedChannels);
}));

router.post('/notificationchannels', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    description,
    config,
    enabled,
    displayOrder,
    icon
  } = req.body;

  // Vérifier les données requises
  if (!name || !type) {
    return res.status(400).json({ message: 'Les champs name et type sont requis' });
  }

  // Créer le canal de notification
  const channel = await NotificationChannel.create({
    name,
    type,
    description,
    config,
    enabled: enabled !== undefined ? enabled : true,
    displayOrder: displayOrder || 0,
    icon
  });

  // Transformer les données
  const transformedChannel = {
    id: channel.id.toString(),
    name: channel.name,
    type: channel.type,
    description: channel.description || '',
    config: channel.config || {},
    enabled: channel.enabled,
    displayOrder: channel.displayOrder,
    icon: channel.icon || channel.type
  };

  res.status(201).json(transformedChannel);
}));

router.put('/notificationchannels/:id', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    description,
    config,
    enabled,
    displayOrder,
    icon
  } = req.body;

  // Vérifier les données requises
  if (!name || !type) {
    return res.status(400).json({ message: 'Les champs name et type sont requis' });
  }

  const channel = await NotificationChannel.findByPk(req.params.id);
  if (!channel) {
    return res.status(404).json({ message: 'Canal de notification non trouvé' });
  }

  // Mettre à jour le canal
  await channel.update({
    name,
    type,
    description,
    config,
    enabled: enabled !== undefined ? enabled : channel.enabled,
    displayOrder: displayOrder !== undefined ? displayOrder : channel.displayOrder,
    icon
  });

  // Transformer les données
  const transformedChannel = {
    id: channel.id.toString(),
    name: channel.name,
    type: channel.type,
    description: channel.description || '',
    config: channel.config || {},
    enabled: channel.enabled,
    displayOrder: channel.displayOrder,
    icon: channel.icon || channel.type
  };

  res.json(transformedChannel);
}));

router.delete('/notificationchannels/:id', asyncHandler(async (req, res) => {
  const channel = await NotificationChannel.findByPk(req.params.id);
  if (!channel) {
    return res.status(404).json({ message: 'Canal de notification non trouvé' });
  }

  await channel.destroy();
  res.status(204).end();
}));

// 2. Routes pour les modèles de notification
router.get('/notificationtemplates', asyncHandler(async (req, res) => {
  const templates = await NotificationTemplate.findAll({
    include: [{ model: NotificationChannel }],
    order: [['event', 'ASC']]
  });

  // Transformer les données
  const transformedTemplates = templates.map(template => ({
    id: template.id.toString(),
    name: template.name,
    event: template.event,
    subject: template.subject || '',
    content: template.content,
    htmlContent: template.htmlContent || '',
    variables: template.variables || [],
    active: template.active,
    category: template.category || '',
    language: template.language,
    channels: template.NotificationChannels ? template.NotificationChannels.map(channel => ({
      id: channel.id.toString(),
      name: channel.name,
      type: channel.type
    })) : []
  }));

  res.json(transformedTemplates);
}));

router.post('/notificationtemplates', asyncHandler(async (req, res) => {
  const {
    name,
    event,
    subject,
    content,
    htmlContent,
    variables,
    active,
    category,
    language,
    channelIds
  } = req.body;

  // Vérifier les données requises
  if (!name || !event || !content) {
    return res.status(400).json({ message: 'Les champs name, event et content sont requis' });
  }

  // Créer le modèle de notification
  const template = await NotificationTemplate.create({
    name,
    event,
    subject,
    content,
    htmlContent,
    variables,
    active: active !== undefined ? active : true,
    category,
    language: language || 'fr-FR'
  });

  // Associer les canaux si fournis
  if (channelIds && channelIds.length > 0) {
    await template.setNotificationChannels(channelIds);
  }

  // Récupérer le modèle avec ses canaux
  const createdTemplate = await NotificationTemplate.findByPk(template.id, {
    include: [{ model: NotificationChannel }]
  });

  // Transformer les données
  const transformedTemplate = {
    id: createdTemplate.id.toString(),
    name: createdTemplate.name,
    event: createdTemplate.event,
    subject: createdTemplate.subject || '',
    content: createdTemplate.content,
    htmlContent: createdTemplate.htmlContent || '',
    variables: createdTemplate.variables || [],
    active: createdTemplate.active,
    category: createdTemplate.category || '',
    language: createdTemplate.language,
    channels: createdTemplate.NotificationChannels ? createdTemplate.NotificationChannels.map(channel => ({
      id: channel.id.toString(),
      name: channel.name,
      type: channel.type
    })) : []
  };

  res.status(201).json(transformedTemplate);
}));

router.put('/notificationtemplates/:id', asyncHandler(async (req, res) => {
  const {
    name,
    event,
    subject,
    content,
    htmlContent,
    variables,
    active,
    category,
    language,
    channelIds
  } = req.body;

  // Vérifier les données requises
  if (!name || !event || !content) {
    return res.status(400).json({ message: 'Les champs name, event et content sont requis' });
  }

  const template = await NotificationTemplate.findByPk(req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Modèle de notification non trouvé' });
  }

  // Mettre à jour le modèle
  await template.update({
    name,
    event,
    subject,
    content,
    htmlContent,
    variables,
    active: active !== undefined ? active : template.active,
    category,
    language: language || template.language
  });

  // Mettre à jour les associations de canaux si fournis
  if (channelIds) {
    await template.setNotificationChannels(channelIds);
  }

  // Récupérer le modèle mis à jour avec ses canaux
  const updatedTemplate = await NotificationTemplate.findByPk(template.id, {
    include: [{ model: NotificationChannel }]
  });

  // Transformer les données
  const transformedTemplate = {
    id: updatedTemplate.id.toString(),
    name: updatedTemplate.name,
    event: updatedTemplate.event,
    subject: updatedTemplate.subject || '',
    content: updatedTemplate.content,
    htmlContent: updatedTemplate.htmlContent || '',
    variables: updatedTemplate.variables || [],
    active: updatedTemplate.active,
    category: updatedTemplate.category || '',
    language: updatedTemplate.language,
    channels: updatedTemplate.NotificationChannels ? updatedTemplate.NotificationChannels.map(channel => ({
      id: channel.id.toString(),
      name: channel.name,
      type: channel.type
    })) : []
  };

  res.json(transformedTemplate);
}));

router.delete('/notificationtemplates/:id', asyncHandler(async (req, res) => {
  const template = await NotificationTemplate.findByPk(req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Modèle de notification non trouvé' });
  }

  await template.destroy();
  res.status(204).end();
}));

// 3. Routes pour les préférences de notification
router.get('/notificationpreferences', asyncHandler(async (req, res) => {
  const preferences = await NotificationPreference.findAll({
    include: [{ model: User, as: 'user' }],
    order: [['userId', 'ASC'], ['eventType', 'ASC']]
  });

  // Transformer les données
  const transformedPreferences = preferences.map(pref => ({
    id: pref.id.toString(),
    userId: pref.userId.toString(),
    userName: pref.user ? `${pref.user.firstName} ${pref.user.lastName}` : 'Inconnu',
    eventType: pref.eventType,
    enabledChannels: pref.enabledChannels || [],
    frequency: pref.frequency,
    preferredTime: pref.preferredTime,
    preferredDay: pref.preferredDay,
    enabled: pref.enabled
  }));

  res.json(transformedPreferences);
}));

router.get('/notificationpreferences/user/:userId', asyncHandler(async (req, res) => {
  const preferences = await NotificationPreference.findAll({
    where: { userId: req.params.userId },
    order: [['eventType', 'ASC']]
  });

  // Transformer les données
  const transformedPreferences = preferences.map(pref => ({
    id: pref.id.toString(),
    userId: pref.userId.toString(),
    eventType: pref.eventType,
    enabledChannels: pref.enabledChannels || [],
    frequency: pref.frequency,
    preferredTime: pref.preferredTime,
    preferredDay: pref.preferredDay,
    enabled: pref.enabled
  }));

  res.json(transformedPreferences);
}));

router.post('/notificationpreferences', asyncHandler(async (req, res) => {
  const {
    userId,
    eventType,
    enabledChannels,
    frequency,
    preferredTime,
    preferredDay,
    enabled
  } = req.body;

  // Vérifier les données requises
  if (!userId || !eventType) {
    return res.status(400).json({ message: 'Les champs userId et eventType sont requis' });
  }

  // Vérifier si une préférence existe déjà pour cet utilisateur et cet événement
  const existingPreference = await NotificationPreference.findOne({
    where: { userId, eventType }
  });

  if (existingPreference) {
    return res.status(400).json({ message: 'Une préférence existe déjà pour cet utilisateur et cet événement' });
  }

  // Créer la préférence
  const preference = await NotificationPreference.create({
    userId,
    eventType,
    enabledChannels: enabledChannels || [],
    frequency: frequency || 'immediate',
    preferredTime,
    preferredDay,
    enabled: enabled !== undefined ? enabled : true
  });

  // Transformer les données
  const transformedPreference = {
    id: preference.id.toString(),
    userId: preference.userId.toString(),
    eventType: preference.eventType,
    enabledChannels: preference.enabledChannels || [],
    frequency: preference.frequency,
    preferredTime: preference.preferredTime,
    preferredDay: preference.preferredDay,
    enabled: preference.enabled
  };

  res.status(201).json(transformedPreference);
}));

router.put('/notificationpreferences/:id', asyncHandler(async (req, res) => {
  const {
    enabledChannels,
    frequency,
    preferredTime,
    preferredDay,
    enabled
  } = req.body;

  const preference = await NotificationPreference.findByPk(req.params.id);
  if (!preference) {
    return res.status(404).json({ message: 'Préférence de notification non trouvée' });
  }

  // Mettre à jour la préférence
  await preference.update({
    enabledChannels: enabledChannels || preference.enabledChannels,
    frequency: frequency || preference.frequency,
    preferredTime: preferredTime !== undefined ? preferredTime : preference.preferredTime,
    preferredDay: preferredDay !== undefined ? preferredDay : preference.preferredDay,
    enabled: enabled !== undefined ? enabled : preference.enabled
  });

  // Transformer les données
  const transformedPreference = {
    id: preference.id.toString(),
    userId: preference.userId.toString(),
    eventType: preference.eventType,
    enabledChannels: preference.enabledChannels || [],
    frequency: preference.frequency,
    preferredTime: preference.preferredTime,
    preferredDay: preference.preferredDay,
    enabled: preference.enabled
  };

  res.json(transformedPreference);
}));

router.delete('/notificationpreferences/:id', asyncHandler(async (req, res) => {
  const preference = await NotificationPreference.findByPk(req.params.id);
  if (!preference) {
    return res.status(404).json({ message: 'Préférence de notification non trouvée' });
  }

  await preference.destroy();
  res.status(204).end();
}));

// 4. Routes pour les notifications
router.get('/notifications', asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    include: [
      { model: User, as: 'user' },
      { model: NotificationTemplate, as: 'template' }
    ],
    order: [['createdAt', 'DESC']],
    limit: 100
  });

  // Transformer les données
  const transformedNotifications = notifications.map(notification => ({
    id: notification.id.toString(),
    userId: notification.userId.toString(),
    userName: notification.user ? `${notification.user.firstName} ${notification.user.lastName}` : 'Inconnu',
    templateId: notification.templateId ? notification.templateId.toString() : null,
    templateName: notification.template ? notification.template.name : null,
    type: notification.type,
    title: notification.title,
    content: notification.content,
    data: notification.data || {},
    channel: notification.channel,
    status: notification.status,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    scheduledFor: notification.scheduledFor ? notification.scheduledFor.toISOString() : null,
    priority: notification.priority,
    actionUrl: notification.actionUrl || '',
    actionText: notification.actionText || '',
    createdAt: notification.createdAt.toISOString()
  }));

  res.json(transformedNotifications);
}));

router.get('/notifications/user/:userId', asyncHandler(async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.params.userId },
    include: [{ model: NotificationTemplate, as: 'template' }],
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  // Transformer les données
  const transformedNotifications = notifications.map(notification => ({
    id: notification.id.toString(),
    userId: notification.userId.toString(),
    templateId: notification.templateId ? notification.templateId.toString() : null,
    templateName: notification.template ? notification.template.name : null,
    type: notification.type,
    title: notification.title,
    content: notification.content,
    data: notification.data || {},
    channel: notification.channel,
    status: notification.status,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    scheduledFor: notification.scheduledFor ? notification.scheduledFor.toISOString() : null,
    priority: notification.priority,
    actionUrl: notification.actionUrl || '',
    actionText: notification.actionText || '',
    createdAt: notification.createdAt.toISOString()
  }));

  res.json(transformedNotifications);
}));

router.post('/notifications', asyncHandler(async (req, res) => {
  const {
    userId,
    templateId,
    type,
    title,
    content,
    data,
    channel,
    status,
    scheduledFor,
    priority,
    actionUrl,
    actionText
  } = req.body;

  // Vérifier les données requises
  if (!userId || !type || !title || !content || !channel) {
    return res.status(400).json({ message: 'Les champs userId, type, title, content et channel sont requis' });
  }

  // Créer la notification
  const notification = await Notification.create({
    userId,
    templateId,
    type,
    title,
    content,
    data,
    channel,
    status: status || 'pending',
    scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    priority: priority || 'normal',
    actionUrl,
    actionText
  });

  // Transformer les données
  const transformedNotification = {
    id: notification.id.toString(),
    userId: notification.userId.toString(),
    templateId: notification.templateId ? notification.templateId.toString() : null,
    type: notification.type,
    title: notification.title,
    content: notification.content,
    data: notification.data || {},
    channel: notification.channel,
    status: notification.status,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    scheduledFor: notification.scheduledFor ? notification.scheduledFor.toISOString() : null,
    priority: notification.priority,
    actionUrl: notification.actionUrl || '',
    actionText: notification.actionText || '',
    createdAt: notification.createdAt.toISOString()
  };

  res.status(201).json(transformedNotification);
}));

router.put('/notifications/:id/read', asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification non trouvée' });
  }

  // Marquer comme lue
  await notification.update({
    status: 'read',
    readAt: new Date()
  });

  // Transformer les données
  const transformedNotification = {
    id: notification.id.toString(),
    userId: notification.userId.toString(),
    templateId: notification.templateId ? notification.templateId.toString() : null,
    type: notification.type,
    title: notification.title,
    content: notification.content,
    data: notification.data || {},
    channel: notification.channel,
    status: notification.status,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    scheduledFor: notification.scheduledFor ? notification.scheduledFor.toISOString() : null,
    priority: notification.priority,
    actionUrl: notification.actionUrl || '',
    actionText: notification.actionText || '',
    createdAt: notification.createdAt.toISOString()
  };

  res.json(transformedNotification);
}));

router.delete('/notifications/:id', asyncHandler(async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification non trouvée' });
  }

  await notification.destroy();
  res.status(204).end();
}));

// 5. Routes pour la configuration des notifications
router.get('/notificationconfig', asyncHandler(async (req, res) => {
  // Récupérer la configuration des notifications (il ne devrait y avoir qu'une seule entrée)
  let config = await NotificationConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await NotificationConfig.create({
      emailEnabled: true,
      smsEnabled: true,
      inAppEnabled: true,
      webhookEnabled: true,
      maxRetries: 3,
      retryDelay: 15,
      retentionPeriod: 90,
      maxNotificationsPerDay: 50,
      batchingEnabled: true,
      batchingInterval: 15,
      advancedSettings: {
        emailThrottling: {
          enabled: true,
          maxPerHour: 100,
          maxPerDay: 500
        },
        smsThrottling: {
          enabled: true,
          maxPerHour: 20,
          maxPerDay: 100
        },
        prioritySettings: {
          highPriorityBypass: true,
          lowPriorityDelay: 60
        },
        deliveryHours: {
          enabled: true,
          start: '08:00',
          end: '20:00',
          timezone: 'Europe/Paris',
          respectWeekends: true
        },
        templates: {
          defaultLanguage: 'fr-FR',
          fallbackLanguage: 'en-US'
        }
      }
    });
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    emailEnabled: config.emailEnabled,
    smsEnabled: config.smsEnabled,
    inAppEnabled: config.inAppEnabled,
    webhookEnabled: config.webhookEnabled,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay,
    retentionPeriod: config.retentionPeriod,
    maxNotificationsPerDay: config.maxNotificationsPerDay,
    batchingEnabled: config.batchingEnabled,
    batchingInterval: config.batchingInterval,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

router.put('/notificationconfig', asyncHandler(async (req, res) => {
  const {
    emailEnabled,
    smsEnabled,
    inAppEnabled,
    webhookEnabled,
    maxRetries,
    retryDelay,
    retentionPeriod,
    maxNotificationsPerDay,
    batchingEnabled,
    batchingInterval,
    advancedSettings
  } = req.body;

  // Récupérer la configuration des notifications (il ne devrait y avoir qu'une seule entrée)
  let config = await NotificationConfig.findOne();

  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = await NotificationConfig.create({
      emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
      smsEnabled: smsEnabled !== undefined ? smsEnabled : true,
      inAppEnabled: inAppEnabled !== undefined ? inAppEnabled : true,
      webhookEnabled: webhookEnabled !== undefined ? webhookEnabled : true,
      maxRetries: maxRetries || 3,
      retryDelay: retryDelay || 15,
      retentionPeriod: retentionPeriod || 90,
      maxNotificationsPerDay: maxNotificationsPerDay || 50,
      batchingEnabled: batchingEnabled !== undefined ? batchingEnabled : true,
      batchingInterval: batchingInterval || 15,
      advancedSettings: advancedSettings || {}
    });
  } else {
    // Mettre à jour les champs
    if (emailEnabled !== undefined) config.emailEnabled = emailEnabled;
    if (smsEnabled !== undefined) config.smsEnabled = smsEnabled;
    if (inAppEnabled !== undefined) config.inAppEnabled = inAppEnabled;
    if (webhookEnabled !== undefined) config.webhookEnabled = webhookEnabled;
    if (maxRetries !== undefined) config.maxRetries = maxRetries;
    if (retryDelay !== undefined) config.retryDelay = retryDelay;
    if (retentionPeriod !== undefined) config.retentionPeriod = retentionPeriod;
    if (maxNotificationsPerDay !== undefined) config.maxNotificationsPerDay = maxNotificationsPerDay;
    if (batchingEnabled !== undefined) config.batchingEnabled = batchingEnabled;
    if (batchingInterval !== undefined) config.batchingInterval = batchingInterval;
    if (advancedSettings !== undefined) config.advancedSettings = advancedSettings;

    await config.save();
  }

  // Transformer les données
  const transformedConfig = {
    id: config.id.toString(),
    emailEnabled: config.emailEnabled,
    smsEnabled: config.smsEnabled,
    inAppEnabled: config.inAppEnabled,
    webhookEnabled: config.webhookEnabled,
    maxRetries: config.maxRetries,
    retryDelay: config.retryDelay,
    retentionPeriod: config.retentionPeriod,
    maxNotificationsPerDay: config.maxNotificationsPerDay,
    batchingEnabled: config.batchingEnabled,
    batchingInterval: config.batchingInterval,
    advancedSettings: config.advancedSettings || {}
  };

  res.json(transformedConfig);
}));

// Routes pour la catégorie "Workflows"
// 1. Routes pour les workflows
router.get('/workflows', asyncHandler(async (req, res) => {
  const workflows = await Workflow.findAll({
    order: [['priority', 'ASC'], ['name', 'ASC']]
  });

  // Transformer les données
  const transformedWorkflows = workflows.map(workflow => ({
    id: workflow.id.toString(),
    name: workflow.name,
    description: workflow.description || '',
    entityType: workflow.entityType,
    triggerEvent: workflow.triggerEvent,
    active: workflow.active,
    priority: workflow.priority,
    config: workflow.config || {}
  }));

  res.json(transformedWorkflows);
}));

router.get('/workflows/:id', asyncHandler(async (req, res) => {
  const workflow = await Workflow.findByPk(req.params.id, {
    include: [
      {
        model: WorkflowStep,
        as: 'steps',
        include: [
          {
            model: WorkflowCondition,
            as: 'conditions'
          }
        ]
      }
    ]
  });

  if (!workflow) {
    return res.status(404).json({ message: 'Workflow non trouvé' });
  }

  // Transformer les données
  const transformedWorkflow = {
    id: workflow.id.toString(),
    name: workflow.name,
    description: workflow.description || '',
    entityType: workflow.entityType,
    triggerEvent: workflow.triggerEvent,
    active: workflow.active,
    priority: workflow.priority,
    config: workflow.config || {},
    steps: workflow.steps ? workflow.steps.map(step => ({
      id: step.id.toString(),
      name: step.name,
      type: step.type,
      assignee: step.assignee,
      assigneeType: step.assigneeType,
      sequence: step.sequence,
      delay: step.delay,
      timeout: step.timeout,
      action: step.action,
      config: step.config || {},
      active: step.active,
      conditions: step.conditions ? step.conditions.map(condition => ({
        id: condition.id.toString(),
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
        valueType: condition.valueType,
        logicGroup: condition.logicGroup,
        sequence: condition.sequence,
        config: condition.config || {}
      })) : []
    })) : []
  };

  res.json(transformedWorkflow);
}));

router.post('/workflows', asyncHandler(async (req, res) => {
  const {
    name,
    description,
    entityType,
    triggerEvent,
    active,
    priority,
    config
  } = req.body;

  // Vérifier les données requises
  if (!name || !entityType || !triggerEvent) {
    return res.status(400).json({ message: 'Les champs name, entityType et triggerEvent sont requis' });
  }

  // Créer le workflow
  const workflow = await Workflow.create({
    name,
    description,
    entityType,
    triggerEvent,
    active: active !== undefined ? active : true,
    priority: priority || 10,
    config
  });

  // Transformer les données
  const transformedWorkflow = {
    id: workflow.id.toString(),
    name: workflow.name,
    description: workflow.description || '',
    entityType: workflow.entityType,
    triggerEvent: workflow.triggerEvent,
    active: workflow.active,
    priority: workflow.priority,
    config: workflow.config || {}
  };

  res.status(201).json(transformedWorkflow);
}));

router.put('/workflows/:id', asyncHandler(async (req, res) => {
  const {
    name,
    description,
    entityType,
    triggerEvent,
    active,
    priority,
    config
  } = req.body;

  // Vérifier les données requises
  if (!name || !entityType || !triggerEvent) {
    return res.status(400).json({ message: 'Les champs name, entityType et triggerEvent sont requis' });
  }

  const workflow = await Workflow.findByPk(req.params.id);
  if (!workflow) {
    return res.status(404).json({ message: 'Workflow non trouvé' });
  }

  // Mettre à jour le workflow
  await workflow.update({
    name,
    description,
    entityType,
    triggerEvent,
    active: active !== undefined ? active : workflow.active,
    priority: priority !== undefined ? priority : workflow.priority,
    config
  });

  // Transformer les données
  const transformedWorkflow = {
    id: workflow.id.toString(),
    name: workflow.name,
    description: workflow.description || '',
    entityType: workflow.entityType,
    triggerEvent: workflow.triggerEvent,
    active: workflow.active,
    priority: workflow.priority,
    config: workflow.config || {}
  };

  res.json(transformedWorkflow);
}));

router.delete('/workflows/:id', asyncHandler(async (req, res) => {
  const workflow = await Workflow.findByPk(req.params.id);
  if (!workflow) {
    return res.status(404).json({ message: 'Workflow non trouvé' });
  }

  await workflow.destroy();
  res.status(204).end();
}));

// 2. Routes pour les étapes de workflow
router.get('/workflowsteps', asyncHandler(async (req, res) => {
  const workflowId = req.query.workflowId;

  const whereClause = workflowId ? { workflowId } : {};

  const steps = await WorkflowStep.findAll({
    where: whereClause,
    order: [['sequence', 'ASC'], ['name', 'ASC']],
    include: [
      {
        model: Workflow,
        as: 'workflow'
      }
    ]
  });

  // Transformer les données
  const transformedSteps = steps.map(step => ({
    id: step.id.toString(),
    workflowId: step.workflowId.toString(),
    workflowName: step.workflow ? step.workflow.name : null,
    name: step.name,
    type: step.type,
    assignee: step.assignee,
    assigneeType: step.assigneeType,
    sequence: step.sequence,
    delay: step.delay,
    timeout: step.timeout,
    action: step.action,
    config: step.config || {},
    active: step.active
  }));

  res.json(transformedSteps);
}));

router.get('/workflowsteps/:id', asyncHandler(async (req, res) => {
  const step = await WorkflowStep.findByPk(req.params.id, {
    include: [
      {
        model: Workflow,
        as: 'workflow'
      },
      {
        model: WorkflowCondition,
        as: 'conditions',
        order: [['sequence', 'ASC']]
      }
    ]
  });

  if (!step) {
    return res.status(404).json({ message: 'Étape de workflow non trouvée' });
  }

  // Transformer les données
  const transformedStep = {
    id: step.id.toString(),
    workflowId: step.workflowId.toString(),
    workflowName: step.workflow ? step.workflow.name : null,
    name: step.name,
    type: step.type,
    assignee: step.assignee,
    assigneeType: step.assigneeType,
    sequence: step.sequence,
    delay: step.delay,
    timeout: step.timeout,
    action: step.action,
    config: step.config || {},
    active: step.active,
    conditions: step.conditions ? step.conditions.map(condition => ({
      id: condition.id.toString(),
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      valueType: condition.valueType,
      logicGroup: condition.logicGroup,
      sequence: condition.sequence,
      config: condition.config || {}
    })) : []
  };

  res.json(transformedStep);
}));

router.post('/workflowsteps', asyncHandler(async (req, res) => {
  const {
    workflowId,
    name,
    type,
    assignee,
    assigneeType,
    sequence,
    delay,
    timeout,
    action,
    config,
    active
  } = req.body;

  // Vérifier les données requises
  if (!workflowId || !name || !type) {
    return res.status(400).json({ message: 'Les champs workflowId, name et type sont requis' });
  }

  // Vérifier que le workflow existe
  const workflow = await Workflow.findByPk(workflowId);
  if (!workflow) {
    return res.status(404).json({ message: 'Workflow non trouvé' });
  }

  // Créer l'étape
  const step = await WorkflowStep.create({
    workflowId,
    name,
    type,
    assignee,
    assigneeType,
    sequence: sequence || 10,
    delay,
    timeout,
    action,
    config,
    active: active !== undefined ? active : true
  });

  // Transformer les données
  const transformedStep = {
    id: step.id.toString(),
    workflowId: step.workflowId.toString(),
    name: step.name,
    type: step.type,
    assignee: step.assignee,
    assigneeType: step.assigneeType,
    sequence: step.sequence,
    delay: step.delay,
    timeout: step.timeout,
    action: step.action,
    config: step.config || {},
    active: step.active
  };

  res.status(201).json(transformedStep);
}));

router.put('/workflowsteps/:id', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    assignee,
    assigneeType,
    sequence,
    delay,
    timeout,
    action,
    config,
    active
  } = req.body;

  // Vérifier les données requises
  if (!name || !type) {
    return res.status(400).json({ message: 'Les champs name et type sont requis' });
  }

  const step = await WorkflowStep.findByPk(req.params.id);
  if (!step) {
    return res.status(404).json({ message: 'Étape de workflow non trouvée' });
  }

  // Mettre à jour l'étape
  await step.update({
    name,
    type,
    assignee,
    assigneeType,
    sequence: sequence !== undefined ? sequence : step.sequence,
    delay,
    timeout,
    action,
    config,
    active: active !== undefined ? active : step.active
  });

  // Transformer les données
  const transformedStep = {
    id: step.id.toString(),
    workflowId: step.workflowId.toString(),
    name: step.name,
    type: step.type,
    assignee: step.assignee,
    assigneeType: step.assigneeType,
    sequence: step.sequence,
    delay: step.delay,
    timeout: step.timeout,
    action: step.action,
    config: step.config || {},
    active: step.active
  };

  res.json(transformedStep);
}));

router.delete('/workflowsteps/:id', asyncHandler(async (req, res) => {
  const step = await WorkflowStep.findByPk(req.params.id);
  if (!step) {
    return res.status(404).json({ message: 'Étape de workflow non trouvée' });
  }

  await step.destroy();
  res.status(204).end();
}));

// 3. Routes pour les conditions des étapes
router.get('/workflowconditions', asyncHandler(async (req, res) => {
  const stepId = req.query.stepId;

  const whereClause = stepId ? { stepId } : {};

  const conditions = await WorkflowCondition.findAll({
    where: whereClause,
    order: [['sequence', 'ASC']],
    include: [
      {
        model: WorkflowStep,
        as: 'step'
      }
    ]
  });

  // Transformer les données
  const transformedConditions = conditions.map(condition => ({
    id: condition.id.toString(),
    stepId: condition.stepId.toString(),
    stepName: condition.step ? condition.step.name : null,
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
    valueType: condition.valueType,
    logicGroup: condition.logicGroup,
    sequence: condition.sequence,
    config: condition.config || {}
  }));

  res.json(transformedConditions);
}));

router.post('/workflowconditions', asyncHandler(async (req, res) => {
  const {
    stepId,
    field,
    operator,
    value,
    valueType,
    logicGroup,
    sequence,
    config
  } = req.body;

  // Vérifier les données requises
  if (!stepId || !field || !operator) {
    return res.status(400).json({ message: 'Les champs stepId, field et operator sont requis' });
  }

  // Vérifier que l'étape existe
  const step = await WorkflowStep.findByPk(stepId);
  if (!step) {
    return res.status(404).json({ message: 'Étape de workflow non trouvée' });
  }

  // Créer la condition
  const condition = await WorkflowCondition.create({
    stepId,
    field,
    operator,
    value,
    valueType: valueType || 'string',
    logicGroup: logicGroup || 'AND',
    sequence: sequence || 10,
    config
  });

  // Transformer les données
  const transformedCondition = {
    id: condition.id.toString(),
    stepId: condition.stepId.toString(),
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
    valueType: condition.valueType,
    logicGroup: condition.logicGroup,
    sequence: condition.sequence,
    config: condition.config || {}
  };

  res.status(201).json(transformedCondition);
}));

router.put('/workflowconditions/:id', asyncHandler(async (req, res) => {
  const {
    field,
    operator,
    value,
    valueType,
    logicGroup,
    sequence,
    config
  } = req.body;

  // Vérifier les données requises
  if (!field || !operator) {
    return res.status(400).json({ message: 'Les champs field et operator sont requis' });
  }

  const condition = await WorkflowCondition.findByPk(req.params.id);
  if (!condition) {
    return res.status(404).json({ message: 'Condition de workflow non trouvée' });
  }

  // Mettre à jour la condition
  await condition.update({
    field,
    operator,
    value,
    valueType: valueType || condition.valueType,
    logicGroup: logicGroup || condition.logicGroup,
    sequence: sequence !== undefined ? sequence : condition.sequence,
    config
  });

  // Transformer les données
  const transformedCondition = {
    id: condition.id.toString(),
    stepId: condition.stepId.toString(),
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
    valueType: condition.valueType,
    logicGroup: condition.logicGroup,
    sequence: condition.sequence,
    config: condition.config || {}
  };

  res.json(transformedCondition);
}));

router.delete('/workflowconditions/:id', asyncHandler(async (req, res) => {
  const condition = await WorkflowCondition.findByPk(req.params.id);
  if (!condition) {
    return res.status(404).json({ message: 'Condition de workflow non trouvée' });
  }

  await condition.destroy();
  res.status(204).end();
}));

// Importer le contrôleur des modules
const moduleController = require('./controllers/moduleController');

// Routes pour les modules
router.get('/modules', asyncHandler(moduleController.getAllModules));
router.get('/modules/:name', asyncHandler(moduleController.getModuleByName));
router.put('/modules/:name/status', asyncHandler(moduleController.toggleModuleStatus));
router.post('/modules/:name/install', asyncHandler(moduleController.installModule));
router.post('/modules/:name/uninstall', asyncHandler(moduleController.uninstallModule));

module.exports = router;
