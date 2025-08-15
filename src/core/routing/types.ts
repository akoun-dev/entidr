import { RouteRecordRaw, RouteMeta as VueRouteMeta, NavigationGuard } from 'vue-router';
import { PermissionLevel } from '../auth/types';

export interface CustomRouteMeta extends VueRouteMeta {
  title?: string;
  permissions?: PermissionLevel[];
  hidden?: boolean;
  transition?: string;
}

export type RouteRecord = RouteRecordRaw & {
  meta?: CustomRouteMeta;
  children?: RouteRecord[];
};

export type RouteGuard = NavigationGuard;

// Helper types for documentation
export interface RouteDocInfo {
  path: string;
  name?: string | symbol;
  meta?: CustomRouteMeta;
  children?: RouteDocInfo[];
}