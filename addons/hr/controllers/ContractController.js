const Contract = require('../../models/Contract');
const Employee = require('../../models/Employee');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

/**
 * Obtenir tous les contrats
 */
exports.getAllContracts = async (req, res) => {
  try {
    const { employee_id, type, status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (employee_id) {
      query.employee_id = employee_id;
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const contracts = await Contract.find(query)
      .populate('employee')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ created_at: -1 });

    const total = await Contract.countDocuments(query);

    res.status(200).json({
      message: 'Contrats récupérés avec succès',
      contracts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contrats' });
  }
};

/**
 * Obtenir un contrat par son ID
 */
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id)
      .populate('employee');

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    res.status(200).json({
      message: 'Contrat récupéré avec succès',
      contract
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du contrat' });
  }
};

/**
 * Créer un nouveau contrat
 */
exports.createContract = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contractData = req.body;

    // Vérifier si l'employé existe
    const employee = await Employee.findById(contractData.employee_id);
    if (!employee) {
      return res.status(400).json({ message: 'Employé non trouvé' });
    }

    // Gérer le fichier si présent
    if (req.file) {
      contractData.file_url = `/uploads/contracts/${req.file.filename}`;
      contractData.file_name = req.file.originalname;
      contractData.mime_type = req.file.mimetype;
      contractData.size_bytes = req.file.size;
    }

    const contract = new Contract(contractData);
    await contract.save();

    // Récupérer le contrat créé avec les informations complètes
    const newContract = await Contract.findById(contract._id)
      .populate('employee');

    res.status(201).json({
      message: 'Contrat créé avec succès',
      contract: newContract
    });
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la création du contrat' });
  }
};

/**
 * Mettre à jour un contrat
 */
exports.updateContract = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si l'employé existe si l'employee_id est modifié
    if (updateData.employee_id) {
      const employee = await Employee.findById(updateData.employee_id);
      if (!employee) {
        return res.status(400).json({ message: 'Employé non trouvé' });
      }
    }

    // Gérer le fichier si présent
    if (req.file) {
      // Supprimer l'ancien fichier s'il existe
      const oldContract = await Contract.findById(id);
      if (oldContract && oldContract.file_url) {
        const oldFilePath = path.join(__dirname, '../../public', oldContract.file_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      updateData.file_url = `/uploads/contracts/${req.file.filename}`;
      updateData.file_name = req.file.originalname;
      updateData.mime_type = req.file.mimetype;
      updateData.size_bytes = req.file.size;
    }

    const contract = await Contract.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('employee');

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    res.status(200).json({
      message: 'Contrat mis à jour avec succès',
      contract
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du contrat' });
  }
};

/**
 * Supprimer un contrat
 */
exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    // Supprimer le fichier s'il existe
    if (contract.file_url) {
      const filePath = path.join(__dirname, '../../public', contract.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Contract.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Contrat supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du contrat' });
  }
};

/**
 * Télécharger un fichier de contrat
 */
exports.downloadContractFile = async (req, res) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findById(id);

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    if (!contract.file_url) {
      return res.status(404).json({ message: 'Fichier non trouvé pour ce contrat' });
    }

    const filePath = path.join(__dirname, '../../public', contract.file_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filePath, contract.file_name || `contract_${id}`);
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier de contrat:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du fichier de contrat' });
  }
};

/**
 * Mettre à jour le statut d'un contrat
 */
exports.updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis' });
    }

    const contract = await Contract.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate('employee');

    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    res.status(200).json({
      message: 'Statut du contrat mis à jour avec succès',
      contract
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du contrat' });
  }
};

/**
 * Obtenir les contrats qui expirent bientôt
 */
exports.getExpiringContracts = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const contracts = await Contract.find({
      end_date: {
        $gte: today,
        $lte: futureDate
      },
      status: { $ne: 'terminated' }
    })
      .populate('employee')
      .sort({ end_date: 1 });

    res.status(200).json({
      message: 'Contrats expirant bientôt récupérés avec succès',
      contracts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats expirant bientôt:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contrats expirant bientôt' });
  }
};
