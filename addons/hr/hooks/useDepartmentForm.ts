
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Department, Manager, ParentDepartment, Company } from '../types/department';

// Additional types for jobs and employees
export interface Job {
  id: string;
  name: string;
  department_id: string;
}

export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department_id: string;
}

export const useDepartmentForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Department state
  const [department, setDepartment] = useState<Department>({
    id: '',
    name: '',
    complete_name: '',
    active: true,
    company_id: '1',
    parent_id: '',
    manager_id: '',
    total_employee: 0,
    note: '',
    color: 0,
    parent_path: '',
    master_department_id: 'none',
    code: ''
  });

  // Mock data - in a real app, these would likely come from API calls
  const [managers] = useState<Manager[]>([
    { id: '1', name: 'Jean Dupont', job_title: 'Directeur Général' },
    { id: '2', name: 'Marie Martin', job_title: 'Responsable RH' },
    { id: '3', name: 'Pierre Durand', job_title: 'Directeur Technique' },
    { id: '4', name: 'Sophie Lefebvre', job_title: 'Directrice Marketing' },
    { id: '5', name: 'Thomas Bernard', job_title: 'Directeur Financier' }
  ]);

  const [parentDepartments] = useState<ParentDepartment[]>([
    { id: '1', name: 'Direction', complete_name: 'Direction' },
    { id: '2', name: 'Ressources Humaines', complete_name: 'Direction / Ressources Humaines' },
    { id: '3', name: 'Informatique', complete_name: 'Direction / Informatique' },
    { id: '4', name: 'Finance', complete_name: 'Direction / Finance' },
    { id: '5', name: 'Marketing', complete_name: 'Direction / Marketing' }
  ]);

  const [companies] = useState<Company[]>([
    { id: '1', name: 'Ma Société' },
    { id: '2', name: 'Filiale 1' },
    { id: '3', name: 'Filiale 2' }
  ]);

  const [jobs] = useState<Job[]>([
    { id: '1', name: 'Développeur Frontend', department_id: '3' },
    { id: '2', name: 'Développeur Backend', department_id: '3' },
    { id: '3', name: 'Chef de projet', department_id: '3' },
    { id: '4', name: 'Responsable RH', department_id: '2' },
    { id: '5', name: 'Assistant RH', department_id: '2' },
    { id: '6', name: 'Comptable', department_id: '4' },
    { id: '7', name: 'Responsable Marketing', department_id: '5' }
  ]);

  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Jean Dupont', job_title: 'Directeur Général', department_id: '1' },
    { id: '2', name: 'Marie Martin', job_title: 'Responsable RH', department_id: '2' },
    { id: '3', name: 'Pierre Durand', job_title: 'Directeur Technique', department_id: '3' },
    { id: '4', name: 'Sophie Lefebvre', job_title: 'Directrice Marketing', department_id: '5' },
    { id: '5', name: 'Thomas Bernard', job_title: 'Directeur Financier', department_id: '4' },
    { id: '6', name: 'Julie Moreau', job_title: 'Développeur Frontend', department_id: '3' },
    { id: '7', name: 'Lucas Petit', job_title: 'Développeur Backend', department_id: '3' },
    { id: '8', name: 'Emma Leroy', job_title: 'Chef de projet', department_id: '3' },
    { id: '9', name: 'Hugo Roux', job_title: 'Comptable', department_id: '4' },
    { id: '10', name: 'Camille Girard', job_title: 'Assistant RH', department_id: '2' }
  ]);

  // Load department data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Simulate loading from API
      const mockDepartment = {
        id: id || '',
        name: 'Informatique',
        complete_name: 'Direction / Informatique',
        active: true,
        company_id: '1',
        parent_id: '1',
        manager_id: '3',
        total_employee: 5,
        note: 'Département informatique responsable du développement et de la maintenance des systèmes d\'information.',
        color: 2,
        parent_path: '1/3',
        master_department_id: '1',
        code: 'IT'
      };

      setDepartment(mockDepartment);
    }
  }, [id, isEditMode]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setDepartment(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setDepartment(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Simulate a successful save
    alert(`Département ${isEditMode ? 'modifié' : 'créé'} avec succès !`);
    navigate('/hr/departments');
  };

  return {
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
  };
};
