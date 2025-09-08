
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Building2,
  FileText,
  LayoutDashboard,
  UserCheck,
  UserX,
  Workflow,
  Shield,
  PenTool
} from 'lucide-react';

/**
 * Composant de navigation pour le module RH
 * Design basé sur le menu du tableau de bord HR
 */
export const HrNavigation: React.FC = () => {
  // Définition des liens du menu
  const menuLinks = [
    { to: "/hr", icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />, label: "Tableau de bord", end: true },
    { to: "/hr/employees", icon: <Users className="h-4 w-4" aria-hidden="true" />, label: "Employés" },
    { to: "/hr/departments", icon: <Building2 className="h-4 w-4" aria-hidden="true" />, label: "Départements" },
    { to: "/hr/contracts", icon: <FileText className="h-4 w-4" aria-hidden="true" />, label: "Contrats" },
    { to: "/hr/documents", icon: <FileText className="h-4 w-4" aria-hidden="true" />, label: "Documents" },
    { to: "/hr/onboarding", icon: <UserCheck className="h-4 w-4" aria-hidden="true" />, label: "Onboarding" },
    { to: "/hr/offboarding", icon: <UserX className="h-4 w-4" aria-hidden="true" />, label: "Offboarding" },
    { to: "/hr/workflows", icon: <Workflow className="h-4 w-4" aria-hidden="true" />, label: "Workflows" },
    { to: "/hr/security", icon: <Shield className="h-4 w-4" aria-hidden="true" />, label: "Sécurité & Rôles" },
    { to: "/hr/signatures", icon: <PenTool className="h-4 w-4" aria-hidden="true" />, label: "Signatures" }
  ];

  // Style commun pour les liens
  const getLinkClassName = (isActive: boolean) => {
    const base = 'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors';
    const active = 'bg-ivory-orange text-white shadow-sm after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-0.5 after:bg-ivory-orange after:rounded-full';
    const inactive = 'text-muted-foreground hover:text-foreground hover:bg-muted/50';
    return `${base} ${isActive ? active : inactive}`;
  };

  return (
    <div className="mb-4 overflow-x-auto">
      <nav className="flex space-x-1 border border-border/40 bg-card p-1 rounded-lg shadow-sm min-w-max">
        {menuLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.to}
            end={link.end}
            className={({ isActive }) => getLinkClassName(isActive)}
          >
            <span className="mr-2">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
