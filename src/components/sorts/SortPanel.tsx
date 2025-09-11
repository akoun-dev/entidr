import React from 'react';
import { SortBuilder } from './SortBuilder';
import { SortBuilderProps, SortDefinition, SortConfig } from './SortTypes';

/**
 * Props du composant SortPanel
 */
export interface SortPanelProps extends Omit<SortBuilderProps, 'sorts'> {
  /** Configuration des tris disponibles */
  sorts: SortConfig[];

  /** Titre du panneau */
  title?: string;

  /** Afficher le titre */
  showTitle?: boolean;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Callback de changement de valeur */
  onChange?: (value: SortDefinition) => void;

  /** Callback d'application des tris */
  onApply?: (sorts: SortDefinition) => void;

  /** Callback de réinitialisation des tris */
  onReset?: () => void;

  /** Textes personnalisés */
  texts?: {
    title?: string;
    apply?: string;
    reset?: string;
    clearAll?: string;
    activeSorts?: string;
    noSorts?: string;
  };
}

/**
 * Composant SortPanel - Panneau de tri avancé
 */
export const SortPanel: React.FC<SortPanelProps> = ({
  sorts,
  title = 'Tri',
  showTitle = true,
  className = '',
  style,
  onChange,
  onApply,
  onReset,
  texts,
  ...sortBuilderProps
}) => {
  const defaultTexts = {
    title: 'Tri',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    clearAll: 'Tout effacer',
    activeSorts: 'Tris actifs',
    noSorts: 'Aucun tri actif',
    ...texts
  };

  return (
    <div className={`sort-panel ${className}`} style={style}>
      {showTitle && (
        <div className="sort-panel-header">
          <h3 className="sort-panel-title">{defaultTexts.title}</h3>
        </div>
      )}

      <div className="sort-panel-content">
        <SortBuilder
          sorts={sorts}
          onChange={onChange}
          onApply={onApply}
          onReset={onReset}
          texts={{
            addCondition: '+ Condition',
            remove: 'Supprimer',
            apply: defaultTexts.apply,
            reset: defaultTexts.reset,
            selectField: 'Sélectionner un champ',
            selectOperator: 'Sélectionner un opérateur',
            ascending: 'Croissant',
            descending: 'Décroissant',
            priority: 'Priorité',
            sort: 'Tri'
          }}
          maxConditions={sortBuilderProps.maxConditions}
          showAdvancedOperators={sortBuilderProps.showAdvancedOperators}
          compact={sortBuilderProps.compact}
        />
      </div>
    </div>
  );
};

export default SortPanel;
