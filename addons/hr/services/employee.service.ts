import { Employee } from '../models/types';
import { SearchOptions } from '../../../src/types/addon';
import { api } from '../../../src/config/api';

/**
 * Service pour la gestion des employés
 */
class EmployeeService {

  /**
   * Récupère tous les employés
   * @param options Options de recherche
   * @returns Liste des employés
   */
  async getAllEmployees(options: SearchOptions = {}): Promise<Employee[]> {
    try {
      const res = await api.get<Employee[]>('/hr/employees', { params: options as any });
      return (res.data as any) ?? [];
    } catch (e: any) {
      console.error('[employeeService] getAllEmployees error', e?.message || e);
      throw new Error('Impossible de charger les employés');
    }
  }

  /**
   * Récupère un employé par son ID
   * @param id ID de l'employé
   * @returns L'employé ou null s'il n'existe pas
   */
  async getEmployeeById(id: number): Promise<Employee | null> {
    try {
      const res = await api.get<Employee>(`/hr/employees/${id}`);
      return (res.data as any) ?? null;
    } catch (e: any) {
      console.error('[employeeService] getEmployeeById error', id, e?.message || e);
      throw new Error("Employé introuvable");
    }
  }

  /**
   * Crée un nouvel employé
   * @param employee Données de l'employé
   * @returns L'employé créé
   */
  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    const payload: any = {
      name: employee.name,
      job_title: employee.job_title,
      department_id: employee.department_id,
      work_email: employee.work_email || (employee as any).email,
      work_phone: employee.work_phone || (employee as any).phone,
      mobile_phone: (employee as any).mobile_phone,
      parent_id: (employee as any).parent_id,
      birth_date: (employee as any).birth_date,
      address: (employee as any).address,
      employment_type: (employee as any).employment_type,
      hire_date: (employee as any).hire_date,
      notes: (employee as any).notes,
      active: (employee as any).is_active ?? (employee as any).active ?? true
    };
    try {
      const res = await api.post<Employee>('/hr/employees', payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[employeeService] createEmployee error', payload, e?.message || e);
      throw new Error("Impossible de créer l'employé");
    }
  }

  /**
   * Met à jour un employé existant
   * @param id ID de l'employé
   * @param employee Données à mettre à jour
   * @returns L'employé mis à jour
   */
  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
    const payload: any = {
      name: employee.name,
      job_title: employee.job_title,
      department_id: employee.department_id,
      work_email: employee.work_email || (employee as any).email,
      work_phone: employee.work_phone || (employee as any).phone,
      mobile_phone: (employee as any).mobile_phone,
      parent_id: (employee as any).parent_id,
      birth_date: (employee as any).birth_date,
      address: (employee as any).address,
      employment_type: (employee as any).employment_type,
      hire_date: (employee as any).hire_date,
      notes: (employee as any).notes,
      active: (employee as any).is_active ?? (employee as any).active
    };
    try {
      const res = await api.put<Employee>(`/hr/employees/${id}`, payload);
      return res.data as any;
    } catch (e: any) {
      console.error('[employeeService] updateEmployee error', id, e?.message || e);
      throw new Error("Impossible de mettre à jour l'employé");
    }
  }

  /**
   * Supprime un employé
   * @param id ID de l'employé
   * @returns true si supprimé avec succès
   */
  async deleteEmployee(id: number): Promise<boolean> {
    try {
      await api.delete(`/hr/employees/${id}`);
      return true;
    } catch (e: any) {
      console.error('[employeeService] deleteEmployee error', id, e?.message || e);
      throw new Error("Impossible de supprimer l'employé");
    }
  }
}

export default new EmployeeService();
