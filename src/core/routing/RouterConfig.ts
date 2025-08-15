import { RouteRecord } from './types';
import { PermissionLevel } from '../auth';

export interface RouteConfig {
  path: string;
  component: Promise<() => any>;
  name?: string;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    permissions?: PermissionLevel[];
    hidden?: boolean;
  };
  children?: RouteConfig[];
  fallback?: string;
}

export function defineRoutes(config: RouteConfig[]): RouteRecord[] {
  return config.map(route => ({
    ...route,
    component: () => route.component,
    children: route.children ? defineRoutes(route.children) : []
  }));
}