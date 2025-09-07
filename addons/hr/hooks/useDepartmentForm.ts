
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Department, Manager, ParentDepartment, Company } from '../types/department';
import { departmentService, employeeService } from '../services';
import { useToast } from '../../../src/components/ui/use-toast';

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
  const { toast } = useToast();
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

  const [managers, setManagers] = useState<Manager[]>([]);

  const [parentDepartments, setParentDepartments] = useState<ParentDepartment[]>([]);

  const [companies] = useState<Company[]>([]);

  const [jobs] = useState<Job[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load department data if in edit mode
  useEffect(() => {
    const load = async () => {
      try {
        // charger les départements pour la liste parent
        const deps = await departmentService.getAll();
        setParentDepartments(deps.map((d: any) => ({ id: String(d.id), name: d.name, complete_name: d.name })));
        const emps = await employeeService.getAllEmployees();
        setEmployees(emps.map((e: any) => ({ id: String(e.id), name: e.name, job_title: e.job_title, department_id: String(e.department_id || '') })));
        setManagers(emps.map((e: any) => ({ id: String(e.id), name: e.name, job_title: e.job_title })) as any);
        if (isEditMode && id) {
          const d = await departmentService.getById(id);
          setDepartment(prev => ({
            ...prev,
            id: String(d.id),
            name: d.name,
            active: d.active,
            parent_id: String(d.parent_id || ''),
            manager_id: String(d.manager_id || ''),
          } as any));
        }
      } catch (e) {
        toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
      }
    };
    load();
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      if (isEditMode && id) {
        await departmentService.update(id, { name: department.name, manager_id: Number(department.manager_id) || undefined, active: department.active } as any);
      } else {
        await departmentService.create({ name: department.name, manager_id: Number(department.manager_id) || undefined, active: department.active } as any);
      }
      toast({ title: 'Succès', description: `Département ${isEditMode ? 'modifié' : 'créé'} avec succès` });
      navigate('/hr/departments');
    } catch (e) {
      toast({ title: 'Erreur', description: `Impossible d'enregistrer le département`, variant: 'destructive' });
    }
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
