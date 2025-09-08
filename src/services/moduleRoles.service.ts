import { api } from '../config/api';

export interface UserModuleRole {
  id: number;
  user_id: number;
  module: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export const moduleRolesService = {
  async listForUser(userId: number | string): Promise<UserModuleRole[]> {
    const res = await api.get<UserModuleRole[]>(`/users/${userId}/module-roles`);
    return (res.data as any) ?? [];
  },
  async setUserRole(userId: number | string, module: string, role: string): Promise<UserModuleRole> {
    const res = await api.put<UserModuleRole>(`/users/${userId}/module-roles/${encodeURIComponent(module)}`, { role });
    return res.data as any;
  },
  async removeUserRole(userId: number | string, module: string): Promise<void> {
    await api.delete(`/users/${userId}/module-roles/${encodeURIComponent(module)}`);
  }
};

export default moduleRolesService;

