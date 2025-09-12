import { Contract, Employee } from '../models';
import { validationResult } from 'express-validator';
import * as fs from 'fs';
import * as path from 'path';
import { Op } from 'sequelize';

/**
 * Obtenir tous les contrats
 */
export const getAllContracts = async (req: any, res: any) => {
  try {
    const { employee_id, type, status, search, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { reference: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: contracts } = await Contract.findAndCountAll({
      where,
      include: ['employee'],
      offset: parseInt(offset as any),
      limit: parseInt(limit as any),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Contrats récupérés avec succès',
      contracts,
      pagination: {
        total: count,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(count / parseInt(limit as string))
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
export const getContractById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: ['employee']
    });

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
export const createContract = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contractData = req.body;

    // Vérifier si l'employé existe
    const employee = await Employee.findByPk(contractData.employee_id);
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

    const contract = await Contract.create(contractData);

    // Récupérer le contrat créé avec les informations complètes
    const newContract = await Contract.findByPk(contract.id, {
      include: ['employee']
    });

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
export const updateContract = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si l'employé existe si l'employee_id est modifié
    if (updateData.employee_id) {
      const employee = await Employee.findByPk(updateData.employee_id);
      if (!employee) {
        return res.status(400).json({ message: 'Employé non trouvé' });
      }
    }

    // Gérer le fichier si présent
    if (req.file) {
      // Supprimer l'ancien fichier s'il existe
      const oldContract = await Contract.findByPk(id);
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

    const [affectedRows, [contract]] = await Contract.update(updateData, {
      where: { id },
      returning: true
    });

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    // Récupérer le contrat mis à jour avec les relations
    const updatedContract = await Contract.findByPk(contract.id, {
      include: ['employee']
    });

    res.status(200).json({
      message: 'Contrat mis à jour avec succès',
      contract: updatedContract
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du contrat' });
  }
};

/**
 * Supprimer un contrat
 */
export const deleteContract = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);

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

    await Contract.destroy({
      where: { id }
    });

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
export const downloadContractFile = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);

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
export const updateContractStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis' });
    }

    const [affectedRows, [contract]] = await Contract.update(
      { status },
      {
        where: { id },
        returning: true
      }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    // Récupérer le contrat mis à jour avec les relations
    const updatedContract = await Contract.findByPk(contract.id, {
      include: ['employee']
    });

    res.status(200).json({
      message: 'Statut du contrat mis à jour avec succès',
      contract: updatedContract
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du contrat:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du contrat' });
  }
};

/**
 * Obtenir les contrats qui expirent bientôt
 */
export const getExpiringContracts = async (req: any, res: any) => {
  try {
    const { days = 30 } = req.query;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days as string));

    const contracts = await Contract.findAll({
      where: {
        end_date: {
          [Op.gte]: today,
          [Op.lte]: futureDate
        },
        status: { [Op.ne]: 'terminated' }
      },
      include: ['employee'],
      order: [['end_date', 'ASC']]
    });

    res.status(200).json({
      message: 'Contrats expirant bientôt récupérés avec succès',
      contracts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats expirant bientôt:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des contrats expirant bientôt' });
  }
};
