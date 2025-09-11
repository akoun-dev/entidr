import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BaseFieldWidget, FieldWidgetProps } from './FieldWidgets';

/**
 * Props spécifiques au SelectWidget
 */
export interface SelectWidgetProps extends FieldWidgetProps {
  /** Options de sélection */
  options?: Array<{ value: any; label: string; disabled?: boolean; group?: string }>;

  /** Placeholder personnalisé */
  placeholder?: string;

  /** Mode recherche */
  searchable?: boolean;

  /** Mode multi-sélection */
  multiple?: boolean;

  /** Autoriser la création de nouvelles options */
  creatable?: boolean;

  /** Texte pour l'option vide */
  emptyText?: string;

  /** Texte pour aucune option trouvée */
  noResultsText?: string;

  /** Texte pour charger plus d'options */
  loadingText?: string;

  /** Icône à gauche */
  leftIcon?: React.ReactNode;

  /** Icône à droite */
  rightIcon?: React.ReactNode;

  /** Action sur l'icône droite */
  onRightIconClick?: () => void;

  /** Grouper les options */
  groupBy?: string;

  /** Désactiver le tri des options */
  disableSort?: boolean;

  /** Taille du select */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Widget de champ de type select
 */
export class SelectWidget extends BaseFieldWidget<SelectWidgetProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (value: any): void => {
    this.setValue(value);
  };

  /**
   * Gérer la création d'une nouvelle option
   */
  protected handleCreateOption = (inputValue: string): void => {
    const { options = [] } = this.props;
    const newOption = {
      value: inputValue,
      label: inputValue,
    };
    this.handleChange([...options, newOption]);
  };

  /**
   * Filtrer les options en fonction de la recherche
   */
  protected filterOptions = (searchValue: string): Array<{ value: any; label: string; disabled?: boolean; group?: string }> => {
    const { options = [], groupBy } = this.props;

    if (!searchValue) return options;

    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      (groupBy && option.group?.toLowerCase().includes(searchValue.toLowerCase()))
    );
  };

  /**
   * Grouper les options
   */
  protected groupOptions = (options: Array<{ value: any; label: string; disabled?: boolean; group?: string }>): Record<string, Array<{ value: any; label: string; disabled?: boolean; group?: string }>> => {
    const { groupBy } = this.props;

    if (!groupBy) return { '': options };

    return options.reduce((groups, option) => {
      const group = option.group || 'Autres';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
      return groups;
    }, {} as Record<string, Array<{ value: any; label: string; disabled?: boolean; group?: string }>>);
  };

  /**
   * Rendre le widget select
   */
  protected renderWidget = (): React.ReactNode => {
    const {
      config,
      focused,
      invalid,
      options = [],
      placeholder = config.placeholder,
      searchable,
      multiple,
      creatable,
      emptyText = 'Aucune option disponible',
      noResultsText = 'Aucun résultat trouvé',
      loadingText = 'Chargement...',
      leftIcon,
      rightIcon,
      onRightIconClick,
      groupBy,
      disableSort = false,
      size = 'md',
      disabled,
      readonly
    } = this.props;
    const { value } = this.state;

    // Trier les options si le tri n'est pas désactivé
    const sortedOptions = disableSort ? options : [...options].sort((a, b) => a.label.localeCompare(b.label));

    // Grouper les options si nécessaire
    const groupedOptions = this.groupOptions(sortedOptions);

    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    const selectClasses = [
      'w-full',
      sizeClasses[size],
      invalid ? 'border-red-500 focus-visible:ring-red-500' : '',
      focused ? 'ring-2 ring-ring' : '',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
    ].filter(Boolean).join(' ');

    return (
      <div className="relative">
        {/* Icône gauche */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        {/* Select principal */}
        <Select
          value={value}
          onValueChange={this.handleChange}
          disabled={disabled || config.disabled}
          required={config.required}
        >
          <SelectTrigger className={selectClasses}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(groupedOptions).length === 0 ? (
              <SelectItem value="" disabled>
                {emptyText}
              </SelectItem>
            ) : (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <React.Fragment key={group}>
                  {group && group !== 'Autres' && (
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground bg-muted">
                      {group}
                    </div>
                  )}
                  {groupOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Icône droite */}
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded z-10"
            disabled={disabled || config.disabled}
          >
            {rightIcon}
          </button>
        )}

        {/* Mode création */}
        {creatable && (
          <div className="mt-2 text-xs text-muted-foreground">
            Tapez pour créer une nouvelle option
          </div>
        )}
      </div>
    );
  };
}

export default SelectWidget;
