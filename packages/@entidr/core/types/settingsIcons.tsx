import React from 'react';
import { 
  Settings, Building2, Users, Calendar, Bell, FileText, 
  Globe, CreditCard, Printer, Clock, BarChart2, 
  Cpu, Mail, Box, Truck, Languages, Hash, 
  Cloud, RefreshCw, Zap, Database, Shield,
  LucideIcon
} from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
}

export const SettingsIcon: React.FC<IconProps> = ({ icon: Icon, size = 4 }) => (
  <Icon className={`w-${size} h-${size}`} />
);

export const SettingsItemIcon: React.FC<Omit<IconProps, 'size'>> = ({ icon: Icon }) => (
  <Icon className="w-4 h-4" />
);