import { Department, Employee } from '../models';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

/**
 * Obtenir tous les départements
 */
export const getAllDepartments = async (req: any, res: any) => {
  try {
    const { parent_id, active, search, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (parent_id) {
      where.parent_id = parent_id;
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: departments } = await Department.findAndCountAll({
      where,
      include: ['manager', 'parent_department'],
      offset: parseInt(offset as any),
      limit: parseInt(limit as any),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Départements récupérés avec succès',
      departments,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des départements' });
  }
};

/**
 * Obtenir un département par son ID
 */
export const getDepartmentById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: ['manager', 'parent_department', 'sub_departments', 'employees']
    });

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    res.status(200).json({
      message: 'Département récupéré avec succès',
      department
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du département:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du département' });
  }
};

/**
 * Créer un nouveau département
 */
export const createDepartment = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const departmentData = req.body;

    // Vérifier si le code existe déjà
    if (departmentData.code) {
      const existingDepartment = await Department.findOne({
        where: { code: departmentData.code }
      });
      if (existingDepartment) {
        return res.status(400).json({ message: 'Un département avec ce code existe déjà' });
      }
    }

    const department = await Department.create(departmentData);

    // Récupérer le département créé avec les informations complètes
    const newDepartment = await Department.findByPk(department.id, {
      include: ['manager', 'parent_department']
    });

    res.status(201).json({
      message: 'Département créé avec succès',
      department: newDepartment
    });
  } catch (error) {
    console.error('Erreur lors de la création du département:', error);
    res.status(500).json({ message: 'Erreur lors de la création du département' });
  }
};

/**
 * Mettre à jour un département
 */
export const updateDepartment = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updateData.code) {
      const existingDepartment = await Department.findOne({
        where: {
          code: updateData.code,
          id: { [Op.ne]: id }
        }
      });

      if (existingDepartment) {
        return res.status(400).json({ message: 'Un département avec ce code existe déjà' });
      }
    }

    const [affectedRows, [department]] = await Department.update(updateData, {
      where: { id },
      returning: true
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    // Récupérer le département mis à jour avec les relations
    const updatedDepartment = await Department.findByPk(department.id, {
      include: ['manager', 'parent_department']
    });

    res.status(200).json({
      message: 'Département mis à jour avec succès',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du département:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du département' });
  }
};

/**
 * Supprimer un département
 */
export const deleteDepartment = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des sous-départements
    const subDepartments = await Department.findAll({
      where: { parent_id: id }
    });
    if (subDepartments.length > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer ce département car il contient des sous-départements'
      });
    }

    // Vérifier s'il y a des employés dans ce département
    const employees = await Employee.findAll({
      where: { department_id: id }
    });
    if (employees.length > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer ce département car il contient des employés'
      });
    }

    const deleted = await Department.destroy({
      where: { id }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    res.status(200).json({
      message: 'Département supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du département:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du département' });
  }
};

/**
 * Basculer le statut d'un département
 */
export const toggleDepartmentStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    department.active = !department.active;
    await department.save();

    const updatedDepartment = await Department.findByPk(id, {
      include: ['manager', 'parent_department']
    });

    res.status(200).json({
      message: `Statut du département mis à jour avec succès`,
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut du département:', error);
    res.status(500).json({ message: 'Erreur lors du changement de statut du département' });
  }
};

/**
 * Obtenir les sous-départements d'un département
 */
export const getSubDepartments = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    const subDepartments = await Department.findAll({
      where: { parent_id: id },
      include: ['manager'],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Sous-départements récupérés avec succès',
      departments: subDepartments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-départements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sous-départements' });
  }
};

/**
 * Obtenir les employés d'un département
 */
export const getDepartmentEmployees = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    const employees = await Employee.findAll({
      where: { department_id: id },
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Employés du département récupérés avec succès',
      employees
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés du département:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des employés du département' });
  }
};
