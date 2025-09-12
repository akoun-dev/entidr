// Contrôleurs réels pour le module HR
// Importation des contrôleurs TypeScript
import * as EmployeeController from './EmployeeController';
import * as DepartmentController from './DepartmentController';
import * as ContractController from './ContractController';
import * as DocumentController from './DocumentController';
import * as HRStatsController from './HRStatsController';

// Interface pour l'objet exporté
interface HRControllers {
  EmployeeController: any;
  DepartmentController: any;
  ContractController: any;
  DocumentController: any;
  HRStatsController: any;
}

const controllers: HRControllers = {
  EmployeeController,
  DepartmentController,
  ContractController,
  DocumentController,
  HRStatsController
};

export default controllers;
