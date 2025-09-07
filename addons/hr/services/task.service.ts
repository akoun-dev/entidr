import { api } from '../../../src/config/api';

export interface HrTask {
  id: number;
  employee_id?: number;
  kind: 'onboarding' | 'offboarding';
  title: string;
  description?: string;
  assignee_role?: 'employee'|'manager'|'hr'|'admin'|'it'|'security';
  due_date?: string;
  status: 'pending'|'in_progress'|'done';
  created_at?: string;
  updated_at?: string;
}

export const taskService = {
  async list(kind: 'onboarding'|'offboarding', employee_id?: number) {
    const url = kind === 'onboarding' ? '/hr/onboarding/tasks' : '/hr/offboarding/tasks';
    const res = await api.get<HrTask[]>(url, { params: employee_id ? { employee_id } : undefined });
    return (res.data as any) ?? [];
  },
  async create(payload: Partial<HrTask>) {
    const res = await api.post<HrTask>('/hr/tasks', payload);
    return res.data as any;
  },
  async update(id: number, payload: Partial<HrTask>) {
    const res = await api.put<HrTask>(`/hr/tasks/${id}`, payload);
    return res.data as any;
  },
  async remove(id: number) {
    await api.delete(`/hr/tasks/${id}`);
  }
};

export default taskService;

