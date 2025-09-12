const Employee = require('../../models/Employee');
const Department = require('../../models/Department');
const Contract = require('../../models/Contract');
const Document = require('../../models/Document');

/**
 * Obtenir les statistiques du module HR
 */
exports.getHRStats = async (req, res) => {
  try {
    // Nombre total d'employés
    const totalEmployees = await Employee.countDocuments();

    // Nombre d'employés actifs
    const activeEmployees = await Employee.countDocuments({ active: true });

    // Nombre d'employés inactifs
    const inactiveEmployees = totalEmployees - activeEmployees;

    // Nombre de départements
    const totalDepartments = await Department.countDocuments({ active: true });

    // Nombre de contrats actifs
    const activeContracts = await Contract.countDocuments({ status: 'active' });

    // Nombre de contrats expirant dans les 30 prochains jours
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);

    const expiringContracts = await Contract.countDocuments({
      end_date: {
        $gte: today,
        $lte: futureDate
      },
      status: { $ne: 'terminated' }
    });

    // Nombre de documents expirant dans les 30 prochains jours
    const expiringDocuments = await Document.countDocuments({
      expiry_date: {
        $gte: today,
        $lte: futureDate
      },
      status: { $ne: 'expired' }
    });

    // Répartition des employés par département
    const employeesByDepartment = await Employee.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$department_id',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          department_id: '$_id',
          department_name: '$department.name',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Répartition des contrats par statut
    const contractsByStatus = await Contract.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1
        }
      }
    ]);

    // Répartition des documents par type
    const documentsByType = await Document.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Nouveaux employés par mois (pour les 6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newEmployeesByMonth = await Employee.aggregate([
      {
        $match: {
          hire_date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$hire_date' },
            month: { $month: '$hire_date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Contrats expirant par mois (pour les 6 prochains mois)
    const contractsExpiringByMonth = await Contract.aggregate([
      {
        $match: {
          end_date: { $gte: today },
          status: { $ne: 'terminated' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$end_date' },
            month: { $month: '$end_date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Documents expirant par mois (pour les 6 prochains mois)
    const documentsExpiringByMonth = await Document.aggregate([
      {
        $match: {
          expiry_date: { $gte: today },
          status: { $ne: 'expired' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$expiry_date' },
            month: { $month: '$expiry_date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

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
