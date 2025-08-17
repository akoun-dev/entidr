const { Company, sequelize } = require('../../models');
const logger = require('../../utils/logger.server');

// Liste des champs autorisés pour l'entreprise
const COMPANY_FIELDS = [
  'name',
  'trading_name',
  'description',
  'industry',
  'foundation_date',
  'address',
  'postal_code',
  'city',
  'country',
  'phone',
  'email',
  'website',
  'logo',
  'createdBy',
  'updatedBy'
];

const getCompany = async (req, res) => {
  try {
    // Debug: Vérifier la connexion et les tables
    await sequelize.authenticate();
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables disponibles:', tables);

    if (!tables.includes('Companies')) {
      return res.status(500).json({
        message: 'Table Companies non trouvée',
        tables: tables
      });
    }

    // Requête brute de vérification
    const rawResults = await sequelize.query(
      'SELECT * FROM Companies WHERE id = 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('Résultat requête brute:', rawResults);

    // Requête Sequelize
    const company = await Company.findOne({
      where: { id: 1 },
      attributes: COMPANY_FIELDS,
      raw: true,
      logging: console.log
    });

    if (!company) {
      // Retourner une entreprise par défaut avec tous les champs vides
      const defaultCompany = COMPANY_FIELDS.reduce((acc, field) => {
        acc[field] = '';
        return acc;
      }, {});
      return res.json({
        message: 'Default company data',
        data: defaultCompany
      });
    }

    return res.json({
      message: 'Company retrieved successfully',
      data: company
    });
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCompany = async (req, res) => {
  try {
    // Filtrer uniquement les champs autorisés
    const updateData = {};
    COMPANY_FIELDS.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const [updated] = await Company.update(updateData, {
      where: { id: 1 },
      returning: true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Company not found' });
    }

    console.log('Recherche de company avec options:', {
      tableName: 'Companies',
      where: { id: 1 },
      raw: true
    });

    const company = await Company.findOne({
      tableName: 'Companies',
      where: { id: 1 },
      raw: true,
      logging: console.log
    });

    console.log('Résultat de la requête:', company);
    res.json(company);
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStatus = async (req, res) => {
  try {
    const company = await Company.findOne({
      attributes: ['active'],
      where: { id: 1 }
    });

    res.json({
      status: company?.active ? 'active' : 'inactive',
      message: 'Company status retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting company status:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCompany,
  updateCompany,
  getStatus
};
