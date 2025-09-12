import { Employee, Department, Contract, Document } from '../models';
import { Op } from 'sequelize';

/**
 * Obtenir les statistiques du module HR
 */
export const getHRStats = async (req: any, res: any) => {
  try {
    // Nombre total d'employés
    const totalEmployees = await Employee.count();

    // Nombre d'employés actifs
    const activeEmployees = await Employee.count({
      where: { active: true }
    });

    // Nombre d'employés inactifs
    const inactiveEmployees = totalEmployees - activeEmployees;

    // Nombre de départements
    const totalDepartments = await Department.count({
      where: { active: true }
    });

    // Nombre de contrats actifs
    const activeContracts = await Contract.count({
      where: { status: 'active' }
    });

    // Nombre de contrats expirant dans les 30 prochains jours
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);

    const expiringContracts = await Contract.count({
      where: {
        end_date: {
          [Op.gte]: today,
          [Op.lte]: futureDate
        },
        status: { [Op.ne]: 'terminated' }
      }
    });

    // Nombre de documents expirant dans les 30 prochains jours
    const expiringDocuments = await Document.count({
      where: {
        expiry_date: {
          [Op.gte]: today,
          [Op.lte]: futureDate
        },
        status: { [Op.ne]: 'expired' }
      }
    });

    // Répartition des employés par département
    const employeesByDepartment = await Employee.findAll({
      where: { active: true },
      attributes: ['department_id', [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']],
      group: ['department_id'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['name']
        }
      ],
      order: [[Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'DESC']]
    });

    // Répartition des contrats par statut
    const contractsByStatus = await Contract.findAll({
      attributes: ['status', [Contract.sequelize.fn('COUNT', Contract.sequelize.col('id')), 'count']],
      group: ['status'],
      order: [[Contract.sequelize.fn('COUNT', Contract.sequelize.col('id')), 'DESC']]
    });

    // Répartition des documents par type
    const documentsByType = await Document.findAll({
      attributes: ['type', [Document.sequelize.fn('COUNT', Document.sequelize.col('id')), 'count']],
      group: ['type'],
      order: [[Document.sequelize.fn('COUNT', Document.sequelize.col('id')), 'DESC']]
    });

    // Nouveaux employés par mois (pour les 6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newEmployeesByMonth = await Employee.findAll({
      where: {
        hire_date: { [Op.gte]: sixMonthsAgo }
      },
      attributes: [
        [Employee.sequelize.fn('YEAR', Employee.sequelize.col('hire_date')), 'year'],
        [Employee.sequelize.fn('MONTH', Employee.sequelize.col('hire_date')), 'month'],
        [Employee.sequelize.fn('COUNT', Employee.sequelize.col('id')), 'count']
      ],
      group: [
        Employee.sequelize.fn('YEAR', Employee.sequelize.col('hire_date')),
        Employee.sequelize.fn('MONTH', Employee.sequelize.col('hire_date'))
      ],
      order: [
        [Employee.sequelize.fn('YEAR', Employee.sequelize.col('hire_date')), 'ASC'],
        [Employee.sequelize.fn('MONTH', Employee.sequelize.col('hire_date')), 'ASC']
      ]
    });

    // Contrats expirant par mois (pour les 6 prochains mois)
    const contractsExpiringByMonth = await Contract.findAll({
      where: {
        end_date: { [Op.gte]: today },
        status: { [Op.ne]: 'terminated' }
      },
      attributes: [
        [Contract.sequelize.fn('YEAR', Contract.sequelize.col('end_date')), 'year'],
        [Contract.sequelize.fn('MONTH', Contract.sequelize.col('end_date')), 'month'],
        [Contract.sequelize.fn('COUNT', Contract.sequelize.col('id')), 'count']
      ],
      group: [
        Contract.sequelize.fn('YEAR', Contract.sequelize.col('end_date')),
        Contract.sequelize.fn('MONTH', Contract.sequelize.col('end_date'))
      ],
      order: [
        [Contract.sequelize.fn('YEAR', Contract.sequelize.col('end_date')), 'ASC'],
        [Contract.sequelize.fn('MONTH', Contract.sequelize.col('end_date')), 'ASC']
      ]
    });

    // Documents expirant par mois (pour les 6 prochains mois)
    const documentsExpiringByMonth = await Document.findAll({
      where: {
        expiry_date: { [Op.gte]: today },
        status: { [Op.ne]: 'expired' }
      },
      attributes: [
        [Document.sequelize.fn('YEAR', Document.sequelize.col('expiry_date')), 'year'],
        [Document.sequelize.fn('MONTH', Document.sequelize.col('expiry_date')), 'month'],
        [Document.sequelize.fn('COUNT', Document.sequelize.col('id')), 'count']
      ],
      group: [
        Document.sequelize.fn('YEAR', Document.sequelize.col('expiry_date')),
        Document.sequelize.fn('MONTH', Document.sequelize.col('expiry_date'))
      ],
      order: [
        [Document.sequelize.fn('YEAR', Document.sequelize.col('expiry_date')), 'ASC'],
        [Document.sequelize.fn('MONTH', Document.sequelize.col('expiry_date')), 'ASC']
      ]
    });

    res.status(200).json({
      message: 'Statistiques HR récupérées avec succès',
      stats: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees
        },
        departments: {
          total: totalDepartments
        },
        contracts: {
          active: activeContracts,
          expiringSoon: expiringContracts
        },
        documents: {
          expiringSoon: expiringDocuments
        },
        employeesByDepartment,
        contractsByStatus,
        documentsByType,
        newEmployeesByMonth,
        contractsExpiringByMonth,
        documentsExpiringByMonth
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques HR:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques HR' });
  }
};
