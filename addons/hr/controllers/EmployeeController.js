const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const { validationResult } = require('express-validator');

/**
 * Obtenir tous les employés
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const { department_id, active, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (department_id) {
      query.department_id = department_id;
    }

    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .populate('department')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      message: 'Employés récupérés avec succès',
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
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

    const employee = await Employee.findById(id)
      .populate('department')
      .populate('contracts')
      .populate('documents');

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
    const existingEmployee = await Employee.findOne({ email: employeeData.email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Un employé avec cet email existe déjà' });
    }

    // Créer le nom complet à partir du prénom et du nom
    employeeData.name = `${employeeData.first_name} ${employeeData.last_name}`;

    const employee = new Employee(employeeData);
    await employee.save();

    // Récupérer l'employé créé avec les informations complètes
    const newEmployee = await Employee.findById(employee._id).populate('department');

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
        email: updateData.email,
        _id: { $ne: id }
      });

      if (existingEmployee) {
        return res.status(400).json({ message: 'Un employé avec cet email existe déjà' });
      }
    }

    // Mettre à jour le nom complet si le prénom ou le nom est modifié
    if (updateData.first_name || updateData.last_name) {
      const employee = await Employee.findById(id);
      const firstName = updateData.first_name || employee.first_name;
      const lastName = updateData.last_name || employee.last_name;
      updateData.name = `${firstName} ${lastName}`;
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('department');

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    res.status(200).json({
      message: 'Employé mis à jour avec succès',
      employee
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

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
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

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    employee.active = !employee.active;
    await employee.save();

    const updatedEmployee = await Employee.findById(id).populate('department');

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

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const contracts = await Contract.find({ employee_id: id }).sort({ created_at: -1 });

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

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    const documents = await Document.find({ employee_id: id }).sort({ created_at: -1 });

    res.status(200).json({
      message: 'Documents de l\'employé récupérés avec succès',
      documents
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents de l\'employé:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des documents de l\'employé' });
  }
};
