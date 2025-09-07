
import { useState, useEffect } from 'react';
import { departmentService, employeeService } from '../services';

interface Manager {
  id: string;
  name: string;
  job_title: string;
  avatar_url: string;
}

interface ParentDepartment {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  manager: Manager;
  parent: ParentDepartment;
  description: string;
  is_active: boolean;
  employee_count: number;
}

interface Employee {
  id: string;
  name: string;
  job_title: string;
  avatar_url: string;
  is_active: boolean;
}

interface SubDepartment {
  id: string;
  name: string;
  code: string;
  manager: { name: string };
  employee_count: number;
  is_active: boolean;
}

export const useDepartmentDetail = (departmentId: string) => {
  // State management
  const [department, setDepartment] = useState<Department>({
    id: '',
    name: '',
    code: '',
    manager: { id: '', name: '', job_title: '', avatar_url: '' },
    parent: { id: '', name: '' },
    description: '',
    is_active: true,
    employee_count: 0
  });
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get initials helper function
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Fetch department data
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const dep = await departmentService.getById(departmentId);
        const emps = await employeeService.getAllEmployees();
        const deptEmployees = emps.filter(e => String(e.department_id || '') === String(departmentId));
        setDepartment({
          id: String(dep.id),
          name: dep.name,
          code: '',
          manager: { id: String(dep.manager_id || ''), name: '', job_title: '', avatar_url: '' },
          parent: { id: '', name: '' },
          description: '',
          is_active: dep.active,
          employee_count: deptEmployees.length
        });
        setEmployees(deptEmployees.map(e => ({ id: String(e.id), name: e.name, job_title: e.job_title || '', avatar_url: '', is_active: e.active })));
        setSubDepartments([]);
      } catch (err) {
        console.error('Error fetching department data:', err);
        setError('Une erreur est survenue lors du chargement des données du département.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (departmentId) {
      fetchDepartmentData();
    }
  }, [departmentId]);
  
  return {
    department,
    employees,
    subDepartments,
    isLoading,
    error,
    getInitials
  };
};

export type { Department, Employee, SubDepartment };
