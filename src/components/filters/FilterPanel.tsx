import React from 'react';
import { FilterBuilder, FilterBuilderProps, FilterGroup } from './FilterBuilder';
import { FilterConfig } from './FilterTypes';

/**
 * Props du composant FilterPanel
 */
export interface FilterPanelProps extends Omit<FilterBuilderProps, 'filters'> {
  /** Configuration des filtres disponibles */
  filters: FilterConfig[];

  /** Titre du panneau */
  title?: string;

  /** Afficher le titre */
  showTitle?: boolean;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Callback de changement de valeur */
  onChange?: (value: FilterGroup) => void;

  /** Callback d'application des filtres */
  onApply?: (filters: FilterGroup) => void;

  /** Callback de réinitialisation des filtres */
  onReset?: () => void;

  /** Textes personnalisés */
  texts?: {
    title?: string;
    apply?: string;
    reset?: string;
    clearAll?: string;
    activeFilters?: string;
    noFilters?: string;
  };
}

/**
 * Composant FilterPanel - Panneau de filtrage avancé
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  title = 'Filtres',
  showTitle = true,
  className = '',
  style,
  onChange,
  onApply,
  onReset,
  texts,
  ...filterBuilderProps
}) => {
  const defaultTexts = {
    title: 'Filtres',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    clearAll: 'Tout effacer',
    activeFilters: 'Filtres actifs',
    noFilters: 'Aucun filtre actif',
    ...texts
  };

  return (
    <div className={`filter-panel ${className}`} style={style}>
      {showTitle && (
        <div className="filter-panel-header">
          <h3 className="filter-panel-title">{defaultTexts.title}</h3>
        </div>
      )}

      <div className="filter-panel-content">
        <FilterBuilder
          filters={filters}
          onChange={onChange}
          onApply={onApply}
          onReset={onReset}
          texts={{
            addCondition: '+ Condition',
            addGroup: '+ Groupe',
            remove: 'Supprimer',
            apply: defaultTexts.apply,
            reset: defaultTexts.reset,
            and: 'ET',
            or: 'OU',
            selectField: 'Sélectionner un champ',
            selectOperator: 'Sélectionner un opérateur',
            enterValue: 'Entrez une valeur'
          }}
          defaultLogic={filterBuilderProps.defaultLogic}
          maxConditions={filterBuilderProps.maxConditions}
          maxGroups={filterBuilderProps.maxGroups}
          showAdvancedOperators={filterBuilderProps.showAdvancedOperators}
          compact={filterBuilderProps.compact}
        />
      </div>
    </div>
  );
};

export default FilterPanel;
