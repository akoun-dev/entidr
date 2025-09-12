const { Employee, Department, Contract, Document } = require('../../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Obtenir tous les employés
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const { department_id, active, search, page = 1, limit = 10 } = req.query;

    const where = {};

    if (department_id) {
      where.department_id = department_id;
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { job_title: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: employees } = await Employee.findAndCountAll({
      where,
      include: ['department'],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Employés récupérés avec succès',
      employees,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des employés' });
  }
};

/**
 * Obtenir un employé par son ID
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        'department',
        'contracts',
        'documents'
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    res.status(200).json({
      message: 'Employé récupéré avec succès',
      employee
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'employé' });
  }
};

/**
 * Créer un nouvel employé
 */
exports.createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeData = req.body;

    // Vérifier si l'email existe déjà
    const existingEmployee = await Employee.findOne({
      where: { email: employeeData.email }
    });

    if (existingEmployee) {
      return res.status(400).json({ message: 'Un employé avec cet email existe déjà' });
    }

    // Le nom complet sera généré automatiquement par le hook beforeValidate

    const employee = await Employee.create(employeeData);

    // Récupérer l'employé créé avec les informations complètes
    const newEmployee = await Employee.findByPk(employee.id, {
      include: ['department']
    });

    res.status(201).json({
      message: 'Employé créé avec succès',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'employé' });
  }
};

/**
 * Mettre à jour un employé
 */
exports.updateEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.email) {
      const existingEmployee = await Employee.findOne({
        where: {
          email: updateData.email,
          id: { [Op.ne]: id }
        }
      });

      if (existingEmployee) {
        return res.status(400).json({ message: 'Un employé avec cet email existe déjà' });
      }
    }

    // Le nom complet sera généré automatiquement par le hook beforeValidate

    const [affectedRows, [employee]] = await Employee.update(updateData, {
      where: { id },
      returning: true
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Récupérer l'employé mis à jour avec les relations
    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: ['department']
    });

    res.status(200).json({
      message: 'Employé mis à jour avec succès',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'employé' });
  }
};

/**
 * Supprimer un employé
 */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Employee.destroy({
      where: { id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    res.status(200).json({
      message: 'Employé supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'employé' });
  }
};

/**
 * Basculer le statut d'un employé
 */
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    employee.active = !employee.active;
    await employee.save();

    const updatedEmployee = await Employee.findByPk(id, {
      include: ['department']
    });

    res.status(200).json({
      message: `Statut de l'employé mis à jour avec succès`,
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors du changement de statut de l\'employé' });
  }
};

/**
 * Obtenir les contrats d'un employé
 */
exports.getEmployeeContracts = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const contracts = await Contract.findAll({
      where: { employee_id: id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Contrats de l\'employé récupérés avec succès',
      contracts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contrats de l\'employé' });
  }
};

/**
 * Obtenir les documents d'un employé
 */
exports.getEmployeeDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const documents = await Document.findAll({
      where: { employee_id: id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Documents de l\'employé récupérés avec succès',
      documents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des documents de l\'employé' });
  }
};

/**
 * Obtenir les subordonnés d'un employé
 */
exports.getEmployeeSubordinates = async (req, res) => {
  try {
    const { id } = req.params;

    const subordinates = await Employee.findAll({
      where: { manager_id: id },
      include: ['department'],
      order: [['last_name', 'ASC'], ['first_name', 'ASC']]
    });

    res.status(200).json({
      message: 'Subordonnés récupérés avec succès',
      subordinates
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des subordonnés:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des subordonnés' });
  }
};
