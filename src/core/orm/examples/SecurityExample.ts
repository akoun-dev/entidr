import {
  EntidrBaseModel,
  EntidrModelDecorator,
  Field,
  Method,
  Hook,
  AdvancedFieldType
} from '../EntidrModel';
import {
  EntidrModelSecurity,
  SecurityAction,
  AccessRuleType,
  ModelSecurityConfig,
  FieldSecurityConfig,
  RecordRule,
  SecurityContext
} from '../security/EntidrModelSecurity';
import { EntidrUser, EntidrRole, EntidrPermission } from '../../../types/entidr-security';

/**
 * Interfaces pour les exemples de sécurité
 */
interface TestUser extends EntidrUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  department: string;
}

interface TestRole extends EntidrRole {
  id: string;
  name: string;
  description: string;
  permissions: EntidrPermission[];
}

interface TestPermission extends EntidrPermission {
  id: string;
  name: string;
  description: string;
}

/**
 * Modèle d'exemple pour démontrer la sécurité
 */
@EntidrModelDecorator({
  tableName: 'employees',
  timestamps: true,
  paranoid: true,
  underscored: true
})
export class EmployeeModel extends EntidrBaseModel {
  @Field({
    type: AdvancedFieldType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    unique: true,
    maxLength: 100
  })
  employeeId!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    maxLength: 255
  })
  firstName!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    maxLength: 255
  })
  lastName!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: false,
    widget: 'email'
  })
  email!: string;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 100
  })
  department!: string;

  @Field({
    type: AdvancedFieldType.DECIMAL,
    allowNull: false,
    precision: 10,
    scale: 2
  })
  salary!: number;

  @Field({
    type: AdvancedFieldType.STRING,
    allowNull: true,
    maxLength: 20
  })
  phone!: string;

  @Field({
    type: AdvancedFieldType.ENUM,
    allowNull: false,
    defaultValue: 'active',
    values: ['active', 'inactive', 'on_leave', 'terminated']
  })
  status!: string;

  @Field({
    type: AdvancedFieldType.DATE,
    allowNull: false
  })
  hireDate!: Date;

  @Method({
    name: 'getFullName',
    description: 'Retourne le nom complet de l\'employé',
    returns: { type: 'string', description: 'Nom complet' }
  })
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Method({
    name: 'getAnnualSalary',
    description: 'Calcule le salaire annuel',
    returns: { type: 'number', description: 'Salaire annuel' }
  })
  getAnnualSalary(): number {
    return this.salary * 12;
  }
}

/**
 * Données de test pour la sécurité
 */
const testUsers: TestUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    isAdmin: true,
    department: 'IT'
  },
  {
    id: '2',
    username: 'hr_manager',
    email: 'hr@company.com',
    isAdmin: false,
    department: 'HR'
  },
  {
    id: '3',
    username: 'employee',
    email: 'employee@company.com',
    isAdmin: false,
    department: 'Sales'
  }
];

const testRoles: TestRole[] = [
  {
    id: '1',
    name: 'admin',
    description: 'Administrateur système',
    permissions: [
      { id: '1', name: 'create:*', description: 'Créer n\'importe quelle ressource' },
      { id: '2', name: 'read:*', description: 'Lire n\'importe quelle ressource' },
      { id: '3', name: 'update:*', description: 'Mettre à jour n\'importe quelle ressource' },
      { id: '4', name: 'delete:*', description: 'Supprimer n\'importe quelle ressource' }
    ]
  },
  {
    id: '2',
    name: 'hr_manager',
    description: 'Responsable des ressources humaines',
    permissions: [
      { id: '5', name: 'create:EmployeeModel', description: 'Créer des employés' },
      { id: '6', name: 'read:EmployeeModel', description: 'Lire les employés' },
      { id: '7', name: 'update:EmployeeModel', description: 'Mettre à jour les employés' }
    ]
  },
  {
    id: '3',
    name: 'employee',
    description: 'Employé standard',
    permissions: [
      { id: '8', name: 'read:EmployeeModel', description: 'Lire les employés' }
    ]
  }
];

/**
 * Fonction pour configurer la sécurité du modèle Employee
 */
export function setupEmployeeSecurity(): void {
  // Configuration de sécurité pour le modèle Employee
  const securityConfig: ModelSecurityConfig = {
    model: 'EmployeeModel',
    permissions: {
      [SecurityAction.CREATE]: ['admin', 'hr_manager'],
      [SecurityAction.READ]: ['admin', 'hr_manager', 'employee'],
      [SecurityAction.UPDATE]: ['admin', 'hr_manager'],
      [SecurityAction.DELETE]: ['admin'],
      [SecurityAction.EXPORT]: ['admin', 'hr_manager']
    },
    fieldSecurity: [
      {
        field: 'salary',
        read: false, // Par défaut, le salaire n'est pas lisible
        write: false, // Par défaut, le salaire n'est pas modifiable
        mask: '***', // Masquer avec des étoiles
        sensitive: true,
        permissions: ['admin'], // Seuls les admins peuvent voir le salaire réel
        roles: ['hr_manager'] // Les HR managers peuvent aussi voir le salaire réel
      },
      {
        field: 'phone',
        read: true,
        write: true,
        mask: (value: string, user: TestUser) => {
          // Masquer le numéro de téléphone sauf pour les admins et HR
          if (user.isAdmin || user.department === 'HR') {
            return value;
          }
          return value ? value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 ** ** $5') : value;
        }
      },
      {
        field: 'email',
        read: true,
        write: false, // L'email ne peut pas être modifié facilement
        audit: true // Auditer les accès à l'email
      }
    ],
    recordRules: [
      {
        name: 'department_access',
        type: AccessRuleType.REQUIRE,
        condition: (record: any, user: TestUser) => {
          // Les employés ne peuvent voir que les employés de leur département
          // Sauf les admins et HR qui peuvent voir tout le monde
          return user.isAdmin || user.department === 'HR' || record.department === user.department;
        },
        permissions: [SecurityAction.READ, SecurityAction.UPDATE],
        description: 'Les employés ne peuvent accéder qu\'aux employés de leur département',
        error: 'Vous n\'avez pas accès aux employés d\'autres départements'
      },
      {
        name: 'no_salary_access',
        type: AccessRuleType.DENY,
        condition: (record: any, user: TestUser) => {
          // Interdire l'accès aux salaires élevés pour les non-admins
          return record.salary > 100000 && !user.isAdmin;
        },
        permissions: [SecurityAction.READ],
        description: 'Interdire l\'accès aux salaires très élevés',
        error: 'Accès restreint aux salaires élevés'
      },
      {
        name: 'own_record_update',
        type: AccessRuleType.ALLOW,
        condition: (record: any, user: TestUser) => {
          // Permettre aux employés de mettre à jour leur propre profil
          // (sauf le salaire et le statut)
          return record.employeeId === user.username;
        },
        permissions: [SecurityAction.UPDATE],
        description: 'Les employés peuvent mettre à jour leur propre profil'
      }
    ],
    audit: true // Activer l'audit pour ce modèle
  };

  // Définir la configuration de sécurité
  EntidrModelSecurity.defineSecurity(securityConfig);
}

/**
 * Fonction pour créer des contextes de sécurité de test
 */
export function createTestSecurityContexts(): Map<string, SecurityContext> {
  const contexts = new Map<string, SecurityContext>();

  // Contexte pour l'admin
  contexts.set('1', {
    user: testUsers[0],
    roles: [testRoles[0]],
    permissions: testRoles[0].permissions,
    timestamp: new Date(),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Test Browser'
  });

  // Contexte pour le HR manager
  contexts.set('2', {
    user: testUsers[1],
    roles: [testRoles[1]],
    permissions: testRoles[1].permissions,
    timestamp: new Date(),
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 Test Browser'
  });

  // Contexte pour l'employé standard
  contexts.set('3', {
    user: testUsers[2],
    roles: [testRoles[2]],
    permissions: testRoles[2].permissions,
    timestamp: new Date(),
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 Test Browser'
  });

  return contexts;
}

/**
 * Fonction pour démontrer la sécurité des modèles
 */
export async function demonstrateModelSecurity(): Promise<void> {
  try {
    console.log('=== Démonstration de la sécurité des modèles ===\n');

    // Configurer la sécurité
    setupEmployeeSecurity();
    console.log('✅ Configuration de sécurité définie');

    // Créer les contextes de test
    const contexts = createTestSecurityContexts();
    console.log('✅ Contextes de sécurité créés');

    // Créer des employés de test
    const employees = [
      {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        department: 'IT',
        salary: 75000,
        phone: '0123456789',
        status: 'active',
        hireDate: new Date('2020-01-15')
      },
      {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        department: 'Sales',
        salary: 120000, // Salaire élevé pour tester les règles
        phone: '0987654321',
        status: 'active',
        hireDate: new Date('2019-03-20')
      }
    ];

    console.log('\n=== Test des permissions de création ===');

    // Tester la création avec différents utilisateurs
    for (const [userId, context] of contexts) {
      const user = context.user;
      EntidrModelSecurity.setSecurityContext(context);

      try {
        const canCreate = await EntidrModelSecurity.checkPermission(
          context,
          SecurityAction.CREATE,
          'EmployeeModel'
        );

        console.log(`${user.username} peut créer des employés: ${canCreate}`);

        if (canCreate) {
          // Tenter de créer un employé
          const employee = await EmployeeModel.create(employees[0]);
          console.log(`  -> Employé créé: ${employee.firstName} ${employee.lastName}`);
        }
      } catch (error) {
        console.log(`  -> Erreur de création: ${error.message}`);
      }
    }

    console.log('\n=== Test des permissions de lecture ===');

    // Récupérer tous les employés (sans contexte de sécurité pour la démo)
    const allEmployees = await EmployeeModel.findAll();

    // Tester la lecture avec différents utilisateurs
    for (const [userId, context] of contexts) {
      const user = context.user;
      EntidrModelSecurity.setSecurityContext(context);

      console.log(`\n--- ${user.username} (${user.department}) ---`);

      for (const employee of allEmployees) {
        try {
          const canRead = await EntidrModelSecurity.checkPermission(
            context,
            SecurityAction.READ,
            'EmployeeModel'
          );

          if (canRead) {
            // Simuler la lecture sécurisée
            const secureEmployee = await EntidrModelSecurity.applyFieldSecurityToInstance(
              employee.get({ plain: true }),
              context,
              EntidrModelSecurity.securityConfigs.get('EmployeeModel')!
            );

            console.log(`  ${secureEmployee.firstName} ${secureEmployee.lastName} (${secureEmployee.department})`);
            console.log(`    Email: ${secureEmployee.email}`);
            console.log(`    Salaire: ${secureEmployee.salary}`);
            console.log(`    Téléphone: ${secureEmployee.phone}`);
          }
        } catch (error) {
          console.log(`  -> Erreur de lecture: ${error.message}`);
        }
      }
    }

    console.log('\n=== Test des règles d\'accès aux enregistrements ===');

    // Tester les règles d'accès avec l'employé standard
    const employeeContext = contexts.get('3')!;
    EntidrModelSecurity.setSecurityContext(employeeContext);

    for (const employee of allEmployees) {
      const recordAccess = await EntidrModelSecurity.checkRecordAccess(
        employee.get({ plain: true }),
        employeeContext,
        EntidrModelSecurity.securityConfigs.get('EmployeeModel')!
      );

      console.log(`${employeeContext.user.username} peut accéder à ${employee.firstName} ${employee.lastName}: ${recordAccess}`);
    }

    console.log('\n=== Test des événements d\'audit ===');

    // Afficher les événements d'audit
    const auditEvents = EntidrModelSecurity.getAuditEvents();
    console.log(`Nombre d'événements d'audit: ${auditEvents.length}`);

    // Afficher les 5 derniers événements
    auditEvents.slice(0, 5).forEach(event => {
      console.log(`  ${event.timestamp.toISOString()} - ${event.username} - ${event.action} - ${event.resource} - ${event.success ? 'SUCCESS' : 'FAILED'}`);
      if (event.error) {
        console.log(`    Erreur: ${event.error}`);
      }
    });

    console.log('\n=== Test d\'export des configurations ===');

    // Exporter les configurations de sécurité
    const exportedConfigs = EntidrModelSecurity.exportSecurityConfigs();
    console.log('Configurations exportées:', Object.keys(exportedConfigs));

    console.log('\n✅ Démonstration de sécurité terminée avec succès !');

  } catch (error) {
    console.error('Erreur lors de la démonstration de sécurité:', error);
  }
}

/**
 * Fonction pour tester des scénarios de sécurité spécifiques
 */
export async function testSecurityScenarios(): Promise<void> {
  console.log('\n=== Scénarios de sécurité spécifiques ===\n');

  // Configurer la sécurité
  setupEmployeeSecurity();
  const contexts = createTestSecurityContexts();

  // Scénario 1: Employé qui essaye de voir le salaire d'un collègue
  console.log('Scénario 1: Employé qui essaye de voir le salaire d\'un collègue');
  const employeeContext = contexts.get('3')!;
  EntidrModelSecurity.setSecurityContext(employeeContext);

  const employees = await EmployeeModel.findAll();
  const otherEmployee = employees.find(emp => emp.department !== 'Sales');

  if (otherEmployee) {
    const secureData = EntidrModelSecurity.applyFieldSecurityToInstance(
      otherEmployee.get({ plain: true }),
      employeeContext,
      EntidrModelSecurity.securityConfigs.get('EmployeeModel')!
    );

    console.log(`Salaire visible par l'employé: ${secureData.salary}`);
  }

  // Scénario 2: HR manager qui accède aux informations sensibles
  console.log('\nScénario 2: HR manager qui accède aux informations sensibles');
  const hrContext = contexts.get('2')!;
  EntidrModelSecurity.setSecurityContext(hrContext);

  for (const employee of employees) {
    const secureData = EntidrModelSecurity.applyFieldSecurityToInstance(
      employee.get({ plain: true }),
      hrContext,
      EntidrModelSecurity.securityConfigs.get('EmployeeModel')!
    );

    console.log(`${secureData.firstName} - Salaire: ${secureData.salary} - Téléphone: ${secureData.phone}`);
  }

  // Scénario 3: Tentative de suppression par un non-admin
  console.log('\nScénario 3: Tentative de suppression par un non-admin');
  EntidrModelSecurity.setSecurityContext(employeeContext);

  try {
    const canDelete = await EntidrModelSecurity.checkPermission(
      employeeContext,
      SecurityAction.DELETE,
      'EmployeeModel'
    );
    console.log(`L'employé peut supprimer: ${canDelete}`);

    if (!canDelete) {
      console.log('✅ La permission de suppression est correctement refusée');
    }
  } catch (error) {
    console.log(`✅ Erreur attendue: ${error.message}`);
  }

  console.log('\n✅ Scénarios de sécurité testés avec succès !');
}

// Exporter les fonctions et modèles
export { EmployeeModel, setupEmployeeSecurity, createTestSecurityContexts, demonstrateModelSecurity, testSecurityScenarios };
export default { setupEmployeeSecurity, createTestSecurityContexts, demonstrateModelSecurity, testSecurityScenarios };
