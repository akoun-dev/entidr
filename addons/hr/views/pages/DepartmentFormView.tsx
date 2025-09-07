
import React from 'react';
import { Button } from '../../../../src/components/ui/button';
// Navigation is handled by HrLayout; no need to import HrDashboardMenu here
import { DepartmentFormHeader } from '../../components/department';
import DepartmentTabs from '../../components/department/DepartmentTabs';
import { useDepartmentForm } from '../../hooks/useDepartmentForm';
import { departmentService } from '../../services';
import { ArrowLeft, Save } from 'lucide-react';

/**
 * Vue de création/édition d'un département
 */
const DepartmentFormView: React.FC = () => {
  const {
    department,
    companies,
    parentDepartments,
    managers,
    jobs,
    employees,
    isEditMode,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleSubmit,
    navigate
  } = useDepartmentForm();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête avec actions */}
      <DepartmentFormHeader 
        isEditMode={isEditMode} 
        onSubmit={handleSubmit}
        onDelete={async () => {
          if (!isEditMode || !department.id) return;
          if (!window.confirm('Supprimer ce département ?')) return;
          try {
            await departmentService.remove(department.id);
            navigate('/hr/departments');
          } catch (e) {
            console.error('Erreur suppression département', e);
            alert('Suppression impossible');
          }
        }}
      />

      {/* Menu de navigation géré par HrLayout pour cohérence */}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="mt-8">
        <DepartmentTabs
          department={department}
          companies={companies}
          parentDepartments={parentDepartments}
          managers={managers}
          jobs={jobs}
          employees={employees}
          departmentId={department.id}
          isEditMode={isEditMode}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleSwitchChange={handleSwitchChange}
        />

        <div className="mt-8 flex justify-end gap-3">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/hr/departments')}
            className="h-11 px-5 flex items-center gap-2 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Annuler
          </Button>
          <Button 
            type="submit"
            className="h-11 px-5 bg-ivory-green hover:bg-ivory-green/90 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditMode ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentFormView;
