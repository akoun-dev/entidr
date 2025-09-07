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
  // Identité visuelle
  'logo',
  // Informations légales
  'legal_form',
  'registration_number',
  'vat_number',
  'share_capital',
  'legal_representative',
  'legal_info',
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
      return res.status(500).json({ data: null, error: { message: 'Table Companies non trouvée', tables } });
    }

    // Requête brute de vérification
    const rawResults = await sequelize.query(
      'SELECT * FROM Companies WHERE id = 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('Résultat requête brute:', rawResults);

    // Requête Sequelize - toutes les colonnes sont maintenant disponibles
    const company = await Company.findByPk(1, {
      raw: true,
      logging: console.log
    });

    // Filtrer uniquement les champs autorisés
    const filteredCompany = {};
    COMPANY_FIELDS.forEach(field => {
      if (company && company[field] !== undefined) {
        filteredCompany[field] = company[field];
      } else {
        filteredCompany[field] = '';
      }
    });

    if (!company) {
      // Retourner une entreprise par défaut avec tous les champs vides
      const defaultCompany = COMPANY_FIELDS.reduce((acc, field) => {
        acc[field] = '';
        return acc;
      }, {});
      return res.json({ data: defaultCompany, error: null });
    }

    return res.json({ data: filteredCompany, error: null });
  } catch (error) {
    logger.error('Error fetching company:', error);
    res.status(500).json({ data: null, error: { message: 'Internal server error' } });
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

    // Vérifier l'existence de l'enregistrement id=1, sinon le créer
    let company = await Company.findByPk(1, { raw: false });
    if (!company) {
      company = await Company.create({ createdBy: 1 });
    }

    // Mettre à jour avec les données filtrées
    await company.update(updateData);

    // Retourner l'objet dans un envelope { data }
    const plain = company.get({ plain: true });
    res.json({ data: plain, error: null });
  } catch (error) {
    logger.error('Error updating company:', error);
    res.status(500).json({ data: null, error: { message: 'Internal server error' } });
  }
};

const getStatus = async (req, res) => {
  try {
    // Retourner un statut par défaut puisque la colonne 'active' n'existe pas
    res.json({ data: { status: 'active', message: 'Company status retrieved successfully' }, error: null });
  } catch (error) {
    logger.error('Error getting company status:', error);
    res.status(500).json({ data: null, error: { message: 'Internal server error' } });
  }
};

module.exports = {
  getCompany,
  updateCompany,
  getStatus
};
