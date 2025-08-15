/**
 * Interface représentant un groupe d'utilisateurs
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
}