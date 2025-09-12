import { LucideIcon } from 'lucide-react';

type RoutePath = `/settings/${string}`;

export interface SettingsItem {
  id: string;
  name: string;
  icon: LucideIcon;
  route: RoutePath;
}

export interface SettingsCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  items: SettingsItem[];
}