import { api } from '../../../src/config/api';
import { TTLCache } from './utils/cache';

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
  created_at?: string;
  updated_at?: string;
}

export const securityService = {
  _cache: new TTLCache<any>(),
  // Gestion des rôles
  async listRoles(): Promise<HrRole[]> {
    try {
      const key = 'security:roles:list';
      const cached = this._cache.get(key);
      if (cached) return cached;
      const res = await api.get<HrRole[]>('/hr/security/roles');
      const data = (res.data as any) ?? [];
      this._cache.set(key, data);
      return data;
    } catch (e: any) {
      console.error('[securityService] listRoles error', e?.message || e);
      throw new Error('Impossible de charger les rôles');
    }
  },
  async getRoleById(id: number|string): Promise<HrRole> {
    try {
      const res = await api.get<HrRole>(`/hr/security/roles/${id}`);
      return res.data as any;
    } catch (e: any) {
      console.error('[securityService] getRoleById error', id, e?.message || e);
      throw new Error('Rôle introuvable');
    }
  },
  async createRole(payload: Partial<HrRole>): Promise<HrRole> {
    try {
      const res = await api.post<HrRole>('/hr/security/roles', payload);
      this._cache.clear('security:roles:');
      return res.data as any;
    } catch (e: any) {
      console.error('[securityService] createRole error', payload, e?.message || e);
      throw new Error('Impossible de créer le rôle');
    }
  },
  async updateRole(id: number|string, payload: Partial<HrRole>): Promise<HrRole> {
    try {
      const res = await api.put<HrRole>(`/hr/security/roles/${id}`, payload);
      this._cache.clear('security:roles:');
      return res.data as any;
    } catch (e: any) {
      console.error('[securityService] updateRole error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour le rôle');
    }
  },
  async deleteRole(id: number|string): Promise<void> {
    try {
      await api.delete(`/hr/security/roles/${id}`);
      this._cache.clear('security:roles:');
    } catch (e: any) {
      console.error('[securityService] deleteRole error', id, e?.message || e);
      throw new Error('Impossible de supprimer le rôle');
    }
  },

  // Gestion des permissions
  async listPermissions(): Promise<HrPermission[]> {
    try {
      const key = 'security:permissions:list';
      const cached = this._cache.get(key);
      if (cached) return cached;
      const res = await api.get<HrPermission[]>('/hr/security/permissions');
      const data = (res.data as any) ?? [];
      this._cache.set(key, data);
      return data;
    } catch (e: any) {
      console.error('[securityService] listPermissions error', e?.message || e);
      throw new Error('Impossible de charger les permissions');
    }
  },
  async createPermission(payload: Partial<HrPermission>): Promise<HrPermission> {
    try {
      const res = await api.post<HrPermission>('/hr/security/permissions', payload);
      this._cache.clear('security:permissions:');
      return res.data as any;
    } catch (e: any) {
      console.error('[securityService] createPermission error', payload, e?.message || e);
      throw new Error('Impossible de créer la permission');
    }
  },
  async updatePermission(id: number|string, payload: Partial<HrPermission>): Promise<HrPermission> {
    try {
      const res = await api.put<HrPermission>(`/hr/security/permissions/${id}`, payload);
      this._cache.clear('security:permissions:');
      return res.data as any;
    } catch (e: any) {
      console.error('[securityService] updatePermission error', id, e?.message || e);
      throw new Error('Impossible de mettre à jour la permission');
    }
  },
  async deletePermission(id: number|string): Promise<void> {
    try {
      await api.delete(`/hr/security/permissions/${id}`);
      this._cache.clear('security:permissions:');
    } catch (e: any) {
      console.error('[securityService] deletePermission error', id, e?.message || e);
      throw new Error('Impossible de supprimer la permission');
    }
  },

  // Assignation des permissions aux rôles
  async assignPermissionToRole(roleId: number|string, permissionId: number|string): Promise<void> {
    try {
      await api.post(`/hr/security/roles/${roleId}/permissions`, { permission_id: permissionId });
      this._cache.clear('security:roles:');
    } catch (e: any) {
      console.error('[securityService] assignPermissionToRole error', roleId, permissionId, e?.message || e);
      throw new Error('Impossible d\'assigner la permission au rôle');
    }
  },
  async removePermissionFromRole(roleId: number|string, permissionId: number|string): Promise<void> {
    try {
      await api.delete(`/hr/security/roles/${roleId}/permissions/${permissionId}`);
      this._cache.clear('security:roles:');
    } catch (e: any) {
      console.error('[securityService] removePermissionFromRole error', roleId, permissionId, e?.message || e);
      throw new Error('Impossible de retirer la permission du rôle');
    }
  }
};

export default securityService;
