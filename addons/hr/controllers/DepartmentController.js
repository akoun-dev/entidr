const Department = require('../../models/Department');
const Employee = require('../../models/Employee');
const { validationResult } = require('express-validator');

/**
 * Obtenir tous les départements
 */
exports.getAllDepartments = async (req, res) => {
  try {
    const { parent_id, active, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (parent_id) {
      query.parent_id = parent_id;
    }

    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const departments = await Department.find(query)
      .populate('manager')
      .populate('parent_department')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Department.countDocuments(query);

    res.status(200).json({
      message: 'Départements récupérés avec succès',
      departments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id)
      .populate('manager')
      .populate('parent_department')
      .populate('sub_departments')
      .populate('employees');

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
exports.createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const departmentData = req.body;

    // Vérifier si le code existe déjà
    if (departmentData.code) {
      const existingDepartment = await Department.findOne({ code: departmentData.code });
      if (existingDepartment) {
        return res.status(400).json({ message: 'Un département avec ce code existe déjà' });
      }
    }

    const department = new Department(departmentData);
    await department.save();

    // Récupérer le département créé avec les informations complètes
    const newDepartment = await Department.findById(department._id)
      .populate('manager')
      .populate('parent_department');

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
exports.updateDepartment = async (req, res) => {
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
        code: updateData.code,
        _id: { $ne: id }
      });

      if (existingDepartment) {
        return res.status(400).json({ message: 'Un département avec ce code existe déjà' });
      }
    }

    const department = await Department.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('manager').populate('parent_department');

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    res.status(200).json({
      message: 'Département mis à jour avec succès',
      department
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du département:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du département' });
  }
};

/**
 * Supprimer un département
 */
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des sous-départements
    const subDepartments = await Department.find({ parent_id: id });
    if (subDepartments.length > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer ce département car il contient des sous-départements'
      });
    }

    // Vérifier s'il y a des employés dans ce département
    const employees = await Employee.find({ department_id: id });
    if (employees.length > 0) {
      return res.status(400).json({
        message: 'Impossible de supprimer ce département car il contient des employés'
      });
    }

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
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
exports.toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    department.active = !department.active;
    await department.save();

    const updatedDepartment = await Department.findById(id)
      .populate('manager')
      .populate('parent_department');

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
exports.getSubDepartments = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    const subDepartments = await Department.find({ parent_id: id })
      .populate('manager')
      .sort({ created_at: -1 });

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
exports.getDepartmentEmployees = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);

    if (!department) {
      return res.status(404).json({ message: 'Département non trouvé' });
    }

    const employees = await Employee.find({ department_id: id })
      .sort({ created_at: -1 });

    res.status(200).json({
      message: 'Employés du département récupérés avec succès',
      employees
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés du département:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des employés du département' });
  }
};
