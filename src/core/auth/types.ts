export type PermissionLevel = 
  | 'guest'
  | 'user' 
  | 'admin'
  | 'superadmin'
  | string;

export interface AuthContext {
  userId: string;
  roles: string[];
  permissions: PermissionLevel[];
}

export interface AuthModule {
  hasPermission(level: PermissionLevel): boolean;
  getContext(): AuthContext | null;
}