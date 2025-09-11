import React from 'react';
import { GroupBuilder } from './GroupBuilder';
import { GroupBuilderProps, GroupDefinition, GroupConfig } from './GroupTypes';

/**
 * Props du composant GroupPanel
 */
export interface GroupPanelProps extends Omit<GroupBuilderProps, 'groups'> {
  /** Configuration des groupes disponibles */
  groups: GroupConfig[];

  /** Titre du panneau */
  title?: string;

  /** Afficher le titre */
  showTitle?: boolean;

  /** Classe CSS personnalisée */
  className?: string;

  /** Style inline */
  style?: Record<string, any>;

  /** Callback de changement de valeur */
  onChange?: (value: GroupDefinition) => void;

  /** Callback d'application des groupes */
  onApply?: (groups: GroupDefinition) => void;

  /** Callback de réinitialisation des groupes */
  onReset?: () => void;

  /** Textes personnalisés */
  texts?: {
    title?: string;
    apply?: string;
    reset?: string;
    clearAll?: string;
    activeGroups?: string;
    noGroups?: string;
  };
}

/**
 * Composant GroupPanel - Panneau de groupement avancé
 */
export const GroupPanel: React.FC<GroupPanelProps> = ({
  groups,
  title = 'Groupement',
  showTitle = true,
  className = '',
  style,
  onChange,
  onApply,
  onReset,
  texts,
  ...groupBuilderProps
}) => {
  const defaultTexts = {
    title: 'Groupement',
    apply: 'Appliquer',
    reset: 'Réinitialiser',
    clearAll: 'Tout effacer',
    activeGroups: 'Groupes actifs',
    noGroups: 'Aucun groupe actif',
    ...texts
  };

  return (
    <div className={`group-panel ${className}`} style={style}>
      {showTitle && (
        <div className="group-panel-header">
          <h3 className="group-panel-title">{defaultTexts.title}</h3>
        </div>
      )}

      <div className="group-panel-content">
        <GroupBuilder
          groups={groups}
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
            selectAggregate: 'Sélectionner une agrégation',
            enterValue: 'Entrez une valeur',
            aggregate: 'Agrégation'
          }}
          defaultLogic={groupBuilderProps.defaultLogic}
          maxConditions={groupBuilderProps.maxConditions}
          maxGroups={groupBuilderProps.maxGroups}
          showAdvancedAggregates={groupBuilderProps.showAdvancedAggregates}
          compact={groupBuilderProps.compact}
        />
      </div>
    </div>
  );
};

export default GroupPanel;
