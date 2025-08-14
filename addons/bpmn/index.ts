// Exporter les vues
export * from './views';

// Exporter les routes

export { default as routes } from './routes';

// Exporter le manifeste
export { default as manifest } from './manifest';


// Exporter les composants pour l'enregistrement des routes
import { BpmnDashboardView, ProcessListView, InstanceListView, ConnectorListView } from './views/pages';

export const Components = {
  BpmnDashboardView,
  ProcessListView,
  InstanceListView,
  ConnectorListView
};

// Middleware RBAC spécifique au module BPMN
import { Request, Response, NextFunction } from 'express';

export type BpmnRole =
  | 'SuperAdmin'
  | 'Administrateur'
  | 'Concepteur'
  | 'Éditeur'
  | 'Validateur'
  | 'Opérateur'
  | 'Auditeur'
  | 'Utilisateur final';

export function authorizeBpmn(allowedRoles: BpmnRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles: string[] = (req as any).user?.roles || [];
    if (allowedRoles.some(role => userRoles.includes(role))) {
      return next();
    }
    return res.status(403).json({ error: 'Accès refusé' });
  };
}


export function initialize() {
  // Code d'initialisation du module BPMN
}

export function cleanup() {
  // Code de nettoyage du module BPMN
}
