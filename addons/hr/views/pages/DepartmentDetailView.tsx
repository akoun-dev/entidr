
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  DepartmentHeader,
  DepartmentDescription,
  SubDepartmentsTable,
  EmployeesTable
} from '../components/department';
import { useDepartmentDetail } from '../../hooks/useDepartmentDetail';
import { departmentService } from '../../services';
import { Alert, AlertDescription } from '../../../../src/components/ui/alert';
import { Skeleton } from '../../../../src/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

/**
 * Vue de détail d'un département
 */
const DepartmentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    department, 
    employees, 
    subDepartments, 
    isLoading, 
    error, 
    getInitials 
  } = useDepartmentDetail(id || '');
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Loading skeleton for header */}
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          
          {/* Loading skeleton for department info */}
          <div className="flex gap-6 items-start mt-8 mb-6">
            <Skeleton className="h-24 w-24 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-6">
                <Skeleton className="h-14 w-40" />
                <Skeleton className="h-14 w-40" />
              </div>
            </div>
          </div>
          
          {/* Loading skeletons for content sections */}
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* En-tête avec actions et informations principales */}
      <DepartmentHeader 
        id={id || ''} 
        department={department}
        getInitials={getInitials}
        onDelete={async (depId) => {
          if (!depId) return;
          if (!window.confirm('Supprimer ce département ?')) return;
          try {
            await departmentService.remove(depId);
            navigate('/hr/departments');
          } catch (e) {
            console.error('Erreur suppression département', e);
            alert('Suppression impossible');
          }
        }}
      />
      
      {/* Menu de navigation */}
      {/* <HrDashboardMenu /> */}
      
      {/* Description */}
      <DepartmentDescription description={department.description} />
      
      {/* Sous-départements */}
      <SubDepartmentsTable 
        subDepartments={subDepartments}
        departmentName={department.name}
      />
      
      {/* Employés */}
      <EmployeesTable 
        employees={employees}
        getInitials={getInitials}
      />
    </div>
  );
};

export default DepartmentDetailView;
