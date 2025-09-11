import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { BaseFieldWidget, FieldWidgetProps } from './FieldWidgets';

/**
 * Props spécifiques au MultiSelectWidget
 */
export interface MultiSelectWidgetProps extends FieldWidgetProps {
  /** Options de sélection */
  options?: Array<{ value: any; label: string; disabled?: boolean; group?: string }>;

  /** Placeholder personnalisé */
  placeholder?: string;

  /** Mode recherche */
  searchable?: boolean;

  /** Nombre maximum de sélections */
  maxSelected?: number;

  /** Autoriser la création de nouvelles options */
  creatable?: boolean;

  /** Texte pour l'option vide */
  emptyText?: string;

  /** Texte pour aucune option trouvée */
  noResultsText?: string;

  /** Texte pour charger plus d'options */
  loadingText?: string;

  /** Texte pour le nombre maximum atteint */
  maxSelectedText?: string;

  /** Grouper les options */
  groupBy?: string;

  /** Désactiver le tri des options */
  disableSort?: boolean;

  /** Taille du select */
  size?: 'sm' | 'md' | 'lg';

  /** Afficher les badges des sélections */
  showBadges?: boolean;

  /** Autoriser la désélection */
  allowDeselect?: boolean;
}

/**
 * Widget de champ de type multi-select
 */
export class MultiSelectWidget extends BaseFieldWidget<MultiSelectWidgetProps> {
  /**
   * Gérer le changement de valeur
   */
  protected handleChange = (selectedValue: any): void => {
    const { value = [], maxSelected } = this.props;
    const currentValues = Array.isArray(value) ? value : [value].filter(Boolean);

    if (maxSelected && currentValues.length >= maxSelected) {
      return; // Ne pas ajouter plus d'options que le maximum autorisé
    }

    if (currentValues.includes(selectedValue)) {
      // Désélectionner si déjà sélectionné
      const newValue = currentValues.filter(v => v !== selectedValue);
      this.setValue(newValue);
    } else {
      // Ajouter la nouvelle sélection
      const newValue = [...currentValues, selectedValue];
      this.setValue(newValue);
    }
  };

  /**
   * Supprimer une valeur sélectionnée
   */
  protected handleRemoveValue = (removedValue: any): void => {
    const { value = [] } = this.props;
    const currentValues = Array.isArray(value) ? value : [value].filter(Boolean);
    const newValue = currentValues.filter(v => v !== removedValue);
    this.setValue(newValue);
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
    this.handleChange(newOption.value);
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
   * Obtenir le label d'une option à partir de sa valeur
   */
  protected getOptionLabel = (optionValue: any): string => {
    const { options = [] } = this.props;
    const option = options.find(opt => opt.value === optionValue);
    return option?.label || String(optionValue);
  };

  /**
   * Rendre le widget multi-select
   */
  protected renderWidget = (): React.ReactNode => {
    const {
      config,
      focused,
      invalid,
      options = [],
      placeholder = config.placeholder || 'Sélectionner des options...',
      searchable = true,
      maxSelected,
      creatable,
      emptyText = 'Aucune option disponible',
      noResultsText = 'Aucun résultat trouvé',
      loadingText = 'Chargement...',
      maxSelectedText = 'Nombre maximum de sélections atteint',
      groupBy,
      disableSort = false,
      size = 'md',
      showBadges = true,
      allowDeselect = true,
      disabled,
      readonly
    } = this.props;
    const { value = [] } = this.state;

    const selectedValues = Array.isArray(value) ? value : [value].filter(Boolean);
    const isMaxSelected = maxSelected && selectedValues.length >= maxSelected;

    // Trier les options si le tri n'est pas désactivé
    const sortedOptions = disableSort ? options : [...options].sort((a, b) => a.label.localeCompare(b.label));

    // Grouper les options si nécessaire
    const groupedOptions = this.groupOptions(sortedOptions);

    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    const triggerClasses = [
      'w-full',
      sizeClasses[size],
      'justify-between',
      invalid ? 'border-red-500 focus-visible:ring-red-500' : '',
      focused ? 'ring-2 ring-ring' : '',
      disabled || readonly ? 'opacity-50 cursor-not-allowed' : '',
    ].filter(Boolean).join(' ');

    return (
      <div className="space-y-2">
        {/* Popover de sélection */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={triggerClasses}
              disabled={disabled || readonly || config.disabled}
            >
              {selectedValues.length === 0 ? (
                placeholder
              ) : (
                <span className="truncate">
                  {selectedValues.length} option{selectedValues.length > 1 ? 's' : ''} sélectionnée{selectedValues.length > 1 ? 's' : ''}
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              {searchable && (
                <CommandInput
                  placeholder={isMaxSelected ? maxSelectedText : 'Rechercher...'}
                  disabled={isMaxSelected}
                />
              )}
              <CommandList>
                <CommandEmpty>{noResultsText}</CommandEmpty>
                {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <React.Fragment key={group}>
                    {group && group !== 'Autres' && (
                      <>
                        <CommandGroup heading={group}>
                          {groupOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={this.handleChange}
                              disabled={option.disabled || isMaxSelected}
                              className="flex items-center gap-2"
                            >
                              <Check
                                className={selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'}
                              />
                              <span>{option.label}</span>
                              {option.disabled && (
                                <span className="text-xs text-muted-foreground">(désactivé)</span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                      </>
                    )}
                    {group === 'Autres' && (
                      <CommandGroup>
                        {groupOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={this.handleChange}
                            disabled={option.disabled || isMaxSelected}
                            className="flex items-center gap-2"
                          >
                            <Check
                              className={selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'}
                            />
                            <span>{option.label}</span>
                            {option.disabled && (
                              <span className="text-xs text-muted-foreground">(désactivé)</span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </React.Fragment>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Affichage des badges des sélections */}
        {showBadges && selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((selectedValue) => (
              <Badge
                key={selectedValue}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {this.getOptionLabel(selectedValue)}
                {allowDeselect && !disabled && !readonly && !config.disabled && (
                  <button
                    type="button"
                    onClick={() => this.handleRemoveValue(selectedValue)}
                    className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Indicateur de nombre maximum atteint */}
        {isMaxSelected && (
          <div className="text-xs text-amber-600">
            {maxSelectedText}
          </div>
        )}

        {/* Mode création */}
        {creatable && (
          <div className="text-xs text-muted-foreground">
            Tapez pour créer une nouvelle option
          </div>
        )}
      </div>
    );
  };
}

export default MultiSelectWidget;
