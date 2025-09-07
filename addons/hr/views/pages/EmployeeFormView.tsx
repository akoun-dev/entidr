
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HrLayout } from '../components';
import { useEmployeeForm } from '../../hooks/useEmployeeForm';
import { EmployeeFormHeader, EmployeeForm } from '../../components/employee';

/**
 * Page de création/édition d'un employé
 */
const EmployeeFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const {
    employee,
    departments,
    managers,
    employmentTypes,
    isNewEmployee,
    handleSubmit,
    handleChange,
    handleStatusChange,
    handleDelete,
    loadEmployeeData
  } = useEmployeeForm(id);

  // Chargement des données de l'employé en cas de modification
  useEffect(() => {
    if (id) {
      loadEmployeeData(id);
    }
  }, [id]);

  return (
    <HrLayout>
      <div className="container mx-auto px-4 py-8">
        <EmployeeFormHeader isNewEmployee={isNewEmployee} />

        <EmployeeForm
          employee={employee}
          departments={departments}
          managers={managers}
          employmentTypes={employmentTypes}
          isNewEmployee={isNewEmployee}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </HrLayout>
  );
};

export default EmployeeFormView;
