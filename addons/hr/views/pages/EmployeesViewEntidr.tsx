import React from 'react';
import { EntidrViewRenderer } from '../../../src/components/EntidrViewRenderer';
import { EntidrViewDefinition } from '../src/types/entidr-view';
import { useEmployee } from '../../hooks/useEmployee';
import { useDepartment } from '../../hooks/useDepartment';

/**
 * Vue principale des employés utilisant le composant ENTIDR
 */
export const EmployeesViewEntidr: React.FC = () => {
  const { employees, loading, error, createEmployee, updateEmployee, deleteEmployee } = useEmployee();
  const { departments } = useDepartment();

  // Configuration de la vue LIST pour les employés
  const listViewConfig: EntidrViewDefinition = {
    id: 'hr-employees-list',
    name: 'Liste des employés',
    description: 'Vue liste pour la gestion des employés',
    model: 'Employee',
    type: 'LIST',
    active: true,
    fields: [
      {
        name: 'id',
        label: 'ID',
        widget: 'NUMBER',
        visible: true,
        editable: false,
        required: false,
        order: 1
      },
      {
        name: 'name',
        label: 'Nom',
        widget: 'INPUT',
        visible: true,
        editable: true,
        required: true,
        order: 2
      },
      {
        name: 'email',
        label: 'Email',
        widget: 'EMAIL',
        visible: true,
        editable: true,
        required: true,
        order: 3
      },
      {
        name: 'job_title',
        label: 'Poste',
        widget: 'INPUT',
        visible: true,
        editable: true,
        required: false,
        order: 4
      },
      {
        name: 'department_id',
        label: 'Département',
        widget: 'SELECT',
        visible: true,
        editable: true,
        required: false,
        order: 5,
        options: departments.map(dept => ({ value: dept.id, label: dept.name }))
      },
      {
        name: 'active',
        label: 'Actif',
        widget: 'BOOLEAN',
        visible: true,
        editable: true,
        required: false,
        order: 6
      },
      {
        name: 'created_at',
        label: 'Créé le',
        widget: 'DATETIME',
        visible: true,
        editable: false,
        required: false,
        order: 7
      }
    ],
    actions: [
      {
        id: 'create',
        label: 'Créer',
        icon: 'plus',
        type: 'BUTTON',
        style: 'primary',
        visible: true,
        enabled: true,
        position: 'toolbar'
      },
      {
        id: 'edit',
        label: 'Modifier',
        icon: 'edit',
        type: 'ICON',
        visible: true,
        enabled: true,
        position: 'row'
      },
      {
        id: 'delete',
        label: 'Supprimer',
        icon: 'trash',
        type: 'ICON',
        style: 'danger',
        visible: true,
        enabled: true,
        position: 'row',
        confirm: {
          title: 'Confirmation',
          message: 'Êtes-vous sûr de vouloir supprimer cet employé ?',
          type: 'warning'
        }
      }
    ],
    permissions: {
      visible: true,
      editable: true,
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true,
      import: false
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Employés</h1>
      <EntidrViewRenderer
        view={listViewConfig}
        securityContext={{ user: { id: 1, roles: ['admin'] } }}
        initialData={employees}
        onEvent={(eventName, data) => {
          switch (eventName) {
            case 'create':
              createEmployee(data);
              break;
            case 'update':
              updateEmployee(data.id, data);
              break;
            case 'delete':
              deleteEmployee(data.id);
              break;
            default:
              break;
          }
        }}
      />
    </div>
  );
};

export default EmployeesViewEntidr;
