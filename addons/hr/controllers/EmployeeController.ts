import { Employee, Department, Contract, Document } from '../models';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

/**
 * Obtenir tous les employés
 */
export const getAllEmployees = async (req: any, res: any) => {
  try {
    const { department_id, active, search, page = 1, limit = 10 } = req.query;

    const where: any = {};

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
      offset: parseInt(offset as any),
      limit: parseInt(limit as any),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Employés récupérés avec succès',
      employees,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
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
export const getEmployeeById = async (req: any, res: any) => {
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
export const createEmployee = async (req: any, res: any) => {
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
export const updateEmployee = async (req: any, res: any) => {
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
export const deleteEmployee = async (req: any, res: any) => {
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
export const toggleEmployeeStatus = async (req: any, res: any) => {
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
export const getEmployeeContracts = async (req: any, res: any) => {
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
export const getEmployeeDocuments = async (req: any, res: any) => {
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
export const getEmployeeSubordinates = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const subordinates = await Employee.findAll({
      where: { manager_id: id } as any,
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
