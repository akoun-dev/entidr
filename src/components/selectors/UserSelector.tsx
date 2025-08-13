/**
 * Composant de sélection d'utilisateur
 */
import React from 'react';
import BaseSelector from './BaseSelector';
import { useUsers } from '../../hooks/useReferenceData';

// Interface pour les données d'utilisateur
export interface User {
  id: number | string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  [key: string]: any;
}

export interface UserSelectorProps {
  id?: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  filter?: Record<string, any>;
}

/**
 * Composant pour sélectionner un utilisateur
 */
const UserSelector: React.FC<UserSelectorProps> = ({
  id,
  label = 'Utilisateur',
  helperText,
  placeholder = 'Sélectionner un utilisateur',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
  filter = {},
}) => {
  // Utiliser le hook personnalisé pour récupérer les utilisateurs
  const { data: users, loading, error: fetchError } = useUsers(filter);
  
  // Fonction pour formater le nom d'utilisateur
  const formatUserName = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName} (${user.username})`;
    }
    return user.username;
  };
  
  return (
    <BaseSelector<User>
      id={id}
      label={label}
      helperText={fetchError ? 'Erreur lors du chargement des utilisateurs' : helperText}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={users}
      getOptionId={(user) => user.id.toString()}
      getOptionLabel={formatUserName}
      loading={loading}
      disabled={disabled}
      required={required}
      error={error}
      className={className}
    />
  );
};

export default UserSelector;
