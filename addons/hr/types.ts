// Types pour le module HR

export interface Employee {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  hire_date?: string;
  department_id?: number;
  position?: string;
  salary?: number;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  contracts?: Contract[];
  documents?: Document[];
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  manager_id?: number;
  parent_id?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  manager?: Employee;
  parent_department?: Department;
  sub_departments?: Department[];
  employees?: Employee[];
}

export interface Contract {
  id: number;
  employee_id: number;
  type: 'cdi' | 'cdd' | 'stage' | 'alternance' | 'freelance' | 'temps-partiel';
  title: string;
  start_date: string;
  end_date?: string;
  salary?: number;
  currency?: string;
  working_hours?: number;
  status: 'draft' | 'active' | 'terminated' | 'expired';
  description?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
}

export interface Document {
  id: number;
  employee_id: number;
  type: 'cv' | 'diplome' | 'certificat' | 'contrat' | 'carte_identite' | 'passeport' | 'permis' | 'photo' | 'autre';
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
  expiry_date?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  activeDepartments: number;
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalDocuments: number;
  activeDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}
