const express = require('express');
const router = express.Router();
const hrControllers = require('../controllers');
const hrValidations = require('../validations');
const { authMiddleware } = require('../../auth/middlewares');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de Multer pour l'upload de fichiers
const createUploadDir = (dir) => {
  const uploadDir = path.join(__dirname, '../../public', dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configuration pour les documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createUploadDir('uploads/documents');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Configuration pour les contrats
const contractStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = createUploadDir('uploads/contracts');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const contractUpload = multer({
  storage: contractStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls les PDF, DOC et DOCX sont autorisés.'));
    }
  }
});

// Routes pour les employés
router.get('/employees', authMiddleware, hrControllers.getAllEmployees);
router.get('/employees/:id', authMiddleware, hrControllers.getEmployeeById);
router.post('/employees', authMiddleware, hrValidations.createEmployeeValidation, hrControllers.createEmployee);
router.put('/employees/:id', authMiddleware, hrValidations.updateEmployeeValidation, hrControllers.updateEmployee);
router.delete('/employees/:id', authMiddleware, hrControllers.deleteEmployee);
router.get('/employees/:id/contracts', authMiddleware, hrControllers.getEmployeeContracts);
router.get('/employees/:id/documents', authMiddleware, hrControllers.getEmployeeDocuments);
router.get('/employees/:id/subordinates', authMiddleware, hrControllers.getEmployeeSubordinates);

// Routes pour les départements
router.get('/departments', authMiddleware, hrControllers.getAllDepartments);
router.get('/departments/:id', authMiddleware, hrControllers.getDepartmentById);
router.post('/departments', authMiddleware, hrValidations.createDepartmentValidation, hrControllers.createDepartment);
router.put('/departments/:id', authMiddleware, hrValidations.updateDepartmentValidation, hrControllers.updateDepartment);
router.delete('/departments/:id', authMiddleware, hrControllers.deleteDepartment);
router.patch('/departments/:id/toggle-status', authMiddleware, hrControllers.toggleDepartmentStatus);
router.get('/departments/:id/sub-departments', authMiddleware, hrControllers.getSubDepartments);
router.get('/departments/:id/employees', authMiddleware, hrControllers.getDepartmentEmployees);

// Routes pour les contrats
router.get('/contracts', authMiddleware, hrControllers.getAllContracts);
router.get('/contracts/:id', authMiddleware, hrControllers.getContractById);
router.post('/contracts', authMiddleware, contractUpload.single('file'), hrValidations.createContractValidation, hrControllers.createContract);
router.put('/contracts/:id', authMiddleware, contractUpload.single('file'), hrValidations.updateContractValidation, hrControllers.updateContract);
router.delete('/contracts/:id', authMiddleware, hrControllers.deleteContract);
router.get('/contracts/:id/download', authMiddleware, hrControllers.downloadContractFile);
router.patch('/contracts/:id/status', authMiddleware, hrValidations.updateContractStatusValidation, hrControllers.updateContractStatus);
router.get('/contracts/expiring', authMiddleware, hrControllers.getExpiringContracts);

// Routes pour les documents
router.get('/documents', authMiddleware, hrControllers.getAllDocuments);
router.get('/documents/:id', authMiddleware, hrControllers.getDocumentById);
router.post('/documents', authMiddleware, documentUpload.single('file'), hrValidations.createDocumentValidation, hrControllers.createDocument);
router.put('/documents/:id', authMiddleware, documentUpload.single('file'), hrValidations.updateDocumentValidation, hrControllers.updateDocument);
router.delete('/documents/:id', authMiddleware, hrControllers.deleteDocument);
router.get('/documents/:id/download', authMiddleware, hrControllers.downloadDocumentFile);
router.patch('/documents/:id/status', authMiddleware, hrControllers.updateDocumentStatus);
router.get('/documents/expiring', authMiddleware, hrControllers.getExpiringDocuments);

// Routes pour les statistiques HR
router.get('/stats', authMiddleware, hrControllers.getHRStats);

module.exports = router;
