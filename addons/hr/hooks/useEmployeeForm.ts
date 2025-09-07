
import { useState, useEffect } from 'react';
import { departments } from '../data/departments';
import { managers } from '../data/managers';
import { employmentTypes } from '../data/employmentTypes';
import { useToast } from '../../../src/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services';

/**
 * Hook pour gérer l'état et les actions du formulaire d'employé
 */
export const useEmployeeForm = (employeeId?: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isNewEmployee = !employeeId;
  
  // État pour l'employé
  const [employee, setEmployee] = useState({
    id: employeeId || '',
    name: '',
    job_title: '',
    department_id: '',
    work_email: '',
    work_phone: '',
    mobile_phone: '',
    address: '',
    birth_date: '',
    hire_date: '',
    employment_type: '',
    manager_id: '',
    notes: '',
    is_active: true,
  });

  // Chargement des données de l'employé par ID
  const loadEmployeeData = async (id: string) => {
    try {
      const data = await employeeService.getEmployeeById(Number(id));
      setEmployee({
        id: String(data.id),
        name: data.name,
        job_title: data.job_title || '',
        department_id: String(data.department_id || ''),
        work_email: data.work_email || '',
        work_phone: data.work_phone || '',
        mobile_phone: (data as any).mobile_phone || '',
        address: (data as any).address || '',
        birth_date: (data as any).birth_date || '',
        hire_date: (data as any).hire_date || '',
        employment_type: (data as any).employment_type || '',
        manager_id: String((data as any).parent_id || ''),
        notes: (data as any).notes || '',
        is_active: (data as any).active ?? true,
      });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les données de l\'employé', variant: 'destructive' });
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (isNewEmployee) {
        await employeeService.createEmployee({
          name: employee.name,
          job_title: employee.job_title,
          department_id: Number(employee.department_id) || undefined,
          work_email: employee.work_email,
          work_phone: employee.work_phone,
          mobile_phone: employee.mobile_phone,
          address: employee.address,
          birth_date: employee.birth_date,
          hire_date: employee.hire_date,
          employment_type: employee.employment_type,
          parent_id: Number(employee.manager_id) || undefined,
          notes: employee.notes,
          active: employee.is_active,
        } as any);
      } else {
        await employeeService.updateEmployee(Number(employee.id), {
          name: employee.name,
          job_title: employee.job_title,
          department_id: Number(employee.department_id) || undefined,
          work_email: employee.work_email,
          work_phone: employee.work_phone,
          mobile_phone: employee.mobile_phone,
          address: employee.address,
          birth_date: employee.birth_date,
          hire_date: employee.hire_date,
          employment_type: employee.employment_type,
          parent_id: Number(employee.manager_id) || undefined,
          notes: employee.notes,
          active: employee.is_active,
        } as any);
      }

      toast({ title: isNewEmployee ? 'Employé créé' : 'Employé mis à jour', description: `Les informations de ${employee.name} ont été enregistrées avec succès.` });
      
      // Redirection vers la liste des employés
      navigate('/hr/employees');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement',
        variant: 'destructive'
      });
    }
  };

  // Fonction pour gérer les changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;
    setEmployee(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour gérer le changement de statut actif/inactif
  const handleStatusChange = (checked: boolean) => {
    setEmployee(prev => ({ ...prev, is_active: checked }));
  };

  // Fonction pour gérer la suppression
  const handleDelete = async () => {
    if (!employee.id) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeeService.deleteEmployee(Number(employee.id));
        toast({ title: 'Suppression', description: `L'employé ${employee.name} a été supprimé.` });
        navigate('/hr/employees');
      } catch (e) {
        toast({ title: 'Erreur', description: `Impossible de supprimer l'employé`, variant: 'destructive' });
      }
    }
  };

  // Charger si edit mode
  useEffect(() => {
    if (employeeId) loadEmployeeData(employeeId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  return {
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
  };
};
