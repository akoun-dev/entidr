import { api } from '../../../src/config/api';

export interface HrRole {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HrPermission {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export const securityService = {
  // Gestion des rôles
  async listRoles(): Promise<HrRole[]> {
    const res = await api.get<HrRole[]>('/hr/security/roles');
    return (res.data as any) ?? [];
  },
  async getRoleById(id: number|string): Promise<HrRole> {
    const res = await api.get<HrRole>(`/hr/security/roles/${id}`);
    return res.data as any;
  },
  async createRole(payload: Partial<HrRole>): Promise<HrRole> {
    const res = await api.post<HrRole>('/hr/security/roles', payload);
    return res.data as any;
  },
  async updateRole(id: number|string, payload: Partial<HrRole>): Promise<HrRole> {
    const res = await api.put<HrRole>(`/hr/security/roles/${id}`, payload);
    return res.data as any;
  },
  async deleteRole(id: number|string): Promise<void> {
    await api.delete(`/hr/security/roles/${id}`);
  },

  // Gestion des permissions
  async listPermissions(): Promise<HrPermission[]> {
    const res = await api.get<HrPermission[]>('/hr/security/permissions');
    return (res.data as any) ?? [];
  },
  async createPermission(payload: Partial<HrPermission>): Promise<HrPermission> {
    const res = await api.post<HrPermission>('/hr/security/permissions', payload);
    return res.data as any;
  },
  async updatePermission(id: number|string, payload: Partial<HrPermission>): Promise<HrPermission> {
    const res = await api.put<HrPermission>(`/hr/security/permissions/${id}`, payload);
    return res.data as any;
  },
  async deletePermission(id: number|string): Promise<void> {
    await api.delete(`/hr/security/permissions/${id}`);
  },

  // Assignation des permissions aux rôles
  async assignPermissionToRole(roleId: number|string, permissionId: number|string): Promise<void> {
    await api.post(`/hr/security/roles/${roleId}/permissions`, { permission_id: permissionId });
  },
  async removePermissionFromRole(roleId: number|string, permissionId: number|string): Promise<void> {
    await api.delete(`/hr/security/roles/${roleId}/permissions/${permissionId}`);
  }
};

export default securityService;
