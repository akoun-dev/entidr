const { Document, Employee } = require('../models');
const { validationResult } = require('express-validator');
const responseHelper = require('../../../src/helpers/response');
const fs = require('fs');
const path = require('path');

/**
 * Récupérer tous les documents
 */
exports.getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, employee_id, type, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Construire les conditions de recherche
    const whereClause = {};

    if (employee_id) {
      whereClause.employee_id = employee_id;
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { '$employee.name$': { [require('sequelize').Op.iLike]: `%${search}%` } },
        { '$employee.first_name$': { [require('sequelize').Op.iLike]: `%${search}%` } },
        { '$employee.last_name$': { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    // Récupérer les documents avec pagination
    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Employee,
          as: 'employee'
        },
        {
          model: require('../../../src/models').User,
          as: 'creator'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return responseHelper.success(
      res,
      {
        documents: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      },
      'Documents récupérés avec succès'
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return responseHelper.error(res, 'Erreur lors de la récupération des documents', 500);
  }
};

/**
 * Récupérer un document par son ID
 */
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee'
        },
        {
          model: require('../../../src/models').User,
          as: 'creator'
        }
      ]
    });

    if (!document) {
      return responseHelper.error(res, 'Document non trouvé', 404);
    }

    return responseHelper.success(res, { document }, 'Document récupéré avec succès');
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return responseHelper.error(res, 'Erreur lors de la récupération du document', 500);
  }
};

/**
 * Créer un nouveau document
 */
exports.createDocument = async (req, res) => {
  try {
    // Valider les données d'entrée
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.error(res, 'Données invalides', 400, errors.array());
    }

    const documentData = req.body;

    // Vérifier si l'employé existe
    const employee = await Employee.findByPk(documentData.employee_id);
    if (!employee) {
      return responseHelper.error(res, 'Employé non trouvé', 404);
    }

    // Traiter le fichier s'il est fourni
    if (req.file) {
      // Créer le répertoire des documents s'il n'existe pas
      const documentsDir = path.join(__dirname, '../../../uploads/hr/documents');
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }

      // Générer un nom de fichier unique
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(documentsDir, fileName);

      // Sauvegarder le fichier
      fs.writeFileSync(filePath, req.file.buffer);

      // Ajouter les informations du fichier aux données du document
      documentData.file_name = req.file.originalname;
      documentData.file_path = `/uploads/hr/documents/${fileName}`;
      documentData.file_size = req.file.size;
      documentData.mime_type = req.file.mimetype;
    }

    // Ajouter l'ID de l'utilisateur connecté comme créateur
    documentData.created_by = req.user.id;

    // Créer le document
    const document = await Document.create(documentData);

    return responseHelper.success(
      res,
      { document },
      'Document créé avec succès',
      201
    );
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    return responseHelper.error(res, 'Erreur lors de la création du document', 500);
  }
};

/**
 * Mettre à jour un document
 */
exports.updateDocument = async (req, res) => {
  try {
    // Valider les données d'entrée
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper.error(res, 'Données invalides', 400, errors.array());
    }

    const { id } = req.params;
    const documentData = req.body;

    // Vérifier si le document existe
    const document = await Document.findByPk(id);
    if (!document) {
      return responseHelper.error(res, 'Document non trouvé', 404);
    }

    // Vérifier si l'employé existe
    if (documentData.employee_id) {
      const employee = await Employee.findByPk(documentData.employee_id);
      if (!employee) {
        return responseHelper.error(res, 'Employé non trouvé', 404);
      }
    }

    // Traiter le fichier s'il est fourni
    if (req.file) {
      // Créer le répertoire des documents s'il n'existe pas
      const documentsDir = path.join(__dirname, '../../../uploads/hr/documents');
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
      }

      // Supprimer l'ancien fichier s'il existe
      if (document.file_path) {
        const oldFilePath = path.join(__dirname, '../../../..', document.file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Générer un nom de fichier unique
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(documentsDir, fileName);

      // Sauvegarder le fichier
      fs.writeFileSync(filePath, req.file.buffer);

      // Ajouter les informations du fichier aux données du document
      documentData.file_name = req.file.originalname;
      documentData.file_path = `/uploads/hr/documents/${fileName}`;
      documentData.file_size = req.file.size;
      documentData.mime_type = req.file.mimetype;
    }

    // Mettre à jour le document
    await document.update(documentData);

    return responseHelper.success(
      res,
      { document },
      'Document mis à jour avec succès'
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    return responseHelper.error(res, 'Erreur lors de la mise à jour du document', 500);
  }
};

/**
 * Supprimer un document
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le document existe
    const document = await Document.findByPk(id);
    if (!document) {
      return responseHelper.error(res, 'Document non trouvé', 404);
    }

    // Supprimer le fichier s'il existe
    if (document.file_path) {
      const filePath = path.join(__dirname, '../../../..', document.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Supprimer le document
    await document.destroy();

    return responseHelper.success(res, {}, 'Document supprimé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    return responseHelper.error(res, 'Erreur lors de la suppression du document', 500);
  }
};

/**
 * Télécharger le fichier d'un document
 */
exports.downloadDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le document existe
    const document = await Document.findByPk(id);
    if (!document) {
      return responseHelper.error(res, 'Document non trouvé', 404);
    }

    // Vérifier si le document a un fichier
    if (!document.file_path) {
      return responseHelper.error(res, 'Ce document n\'a pas de fichier associé', 404);
    }

    const filePath = path.join(__dirname, '../../../..', document.file_path);

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return responseHelper.error(res, 'Fichier non trouvé', 404);
    }

    // Envoyer le fichier
    res.download(filePath, document.file_name);
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return responseHelper.error(res, 'Erreur lors du téléchargement du fichier', 500);
  }
};

/**
 * Mettre à jour le statut d'un document
 */
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier si le document existe
    const document = await Document.findByPk(id);
    if (!document) {
      return responseHelper.error(res, 'Document non trouvé', 404);
    }

    // Mettre à jour le statut
    await document.update({ status });

    return responseHelper.success(
      res,
      { document },
      'Statut du document mis à jour avec succès'
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du document:', error);
    return responseHelper.error(res, 'Erreur lors de la mise à jour du statut du document', 500);
  }
};

/**
 * Récupérer les documents qui expirent bientôt
 */
exports.getExpiringDocuments = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const documents = await Document.findAll({
      where: {
        expiry_date: {
          [require('sequelize').Op.lte]: futureDate,
          [require('sequelize').Op.gte]: new Date()
        },
        status: 'active'
      },
      include: [
        {
          model: Employee,
          as: 'employee'
        }
      ],
      order: [['expiry_date', 'ASC']]
    });

    return responseHelper.success(
      res,
      { documents },
      'Documents expirant bientôt récupérés avec succès'
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des documents expirant bientôt:', error);
    return responseHelper.error(res, 'Erreur lors de la récupération des documents expirant bientôt', 500);
  }
};

/**
 * Récupérer les documents expirés
 */
exports.getExpiredDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: {
        expiry_date: {
          [require('sequelize').Op.lt]: new Date()
        },
        status: 'active'
      },
      include: [
        {
          model: Employee,
          as: 'employee'
        }
      ],
      order: [['expiry_date', 'ASC']]
    });

    return responseHelper.success(
      res,
      { documents },
      'Documents expirés récupérés avec succès'
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des documents expirés:', error);
    return responseHelper.error(res, 'Erreur lors de la récupération des documents expirés', 500);
  }
};
