/**
 * Composant de base pour les sélecteurs
 * Ce composant sert de base pour tous les sélecteurs de données de référence
 */
import React from 'react';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';

export interface BaseSelectorProps<T> {
  /**
   * ID unique du sélecteur
   */
  id?: string;
  
  /**
   * Libellé à afficher
   */
  label?: string;
  
  /**
   * Texte d'aide à afficher
   */
  helperText?: string;
  
  /**
   * Texte à afficher quand aucune valeur n'est sélectionnée
   */
  placeholder?: string;
  
  /**
   * Valeur sélectionnée
   */
  value?: string | number;
  
  /**
   * Fonction appelée quand la valeur change
   */
  onChange?: (value: string) => void;
  
  /**
   * Liste des options
   */
  options: T[];
  
  /**
   * Fonction pour extraire l'ID d'une option
   */
  getOptionId: (option: T) => string;
  
  /**
   * Fonction pour extraire le libellé d'une option
   */
  getOptionLabel: (option: T) => string;
  
  /**
   * Indique si le sélecteur est en cours de chargement
   */
  loading?: boolean;
  
  /**
   * Indique si le sélecteur est désactivé
   */
  disabled?: boolean;
  
  /**
   * Indique si le sélecteur est requis
   */
  required?: boolean;
  
  /**
   * Message d'erreur à afficher
   */
  error?: string;
  
  /**
   * Classe CSS supplémentaire
   */
  className?: string;
}

/**
 * Composant de base pour les sélecteurs
 */
function BaseSelector<T>({
  id,
  label,
  helperText,
  placeholder = 'Sélectionner une option',
  value,
  onChange,
  options,
  getOptionId,
  getOptionLabel,
  loading = false,
  disabled = false,
  required = false,
  error,
  className = '',
}: BaseSelectorProps<T>) {
  // Générer un ID unique si non fourni
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={selectId} className="flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={value?.toString()}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id={selectId} className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem 
                key={getOptionId(option)} 
                value={getOptionId(option)}
              >
                {getOptionLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export default BaseSelector;
