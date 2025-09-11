import React from 'react';

/**
 * Props pour le composant KanbanViewCard
 */
export interface KanbanViewCardProps {
  /** Données de la carte */
  card: any;
  /** Mode lecture seule */
  readonly?: boolean;
  /** Mode compact */
  compact?: boolean;
  /** Callback pour le début du glisser */
  onDragStart: (card: any, e: React.DragEvent) => void;
  /** Callback pour le clic */
  onClick: (card: any) => void;
  /** Callback pour le double-clic */
  onDoubleClick: (card: any) => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
}

/**
 * Composant KanbanViewCard - Carte du Kanban
 * Affiche une carte individuelle avec ses informations
 */
export const KanbanViewCard: React.FC<KanbanViewCardProps> = ({
  card,
  readonly = false,
  compact = false,
  onDragStart,
  onClick,
  onDoubleClick,
  onEvent,
}) => {
  // Gérer le clic sur la carte
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(card);
  };

  // Gérer le double-clic sur la carte
  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(card);
  };

  // Gérer le début du glisser
  const handleDragStart = (e: React.DragEvent) => {
    if (!readonly) {
      onDragStart(card, e);
    } else {
      e.preventDefault();
    }
  };

  // Gérer le clic sur le bouton d'édition
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEvent('edit', card);
  };

  // Gérer le clic sur le bouton de suppression
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      onEvent('delete', card);
    }
  };

  // Gérer le clic sur le bouton d'actions
  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEvent('cardActions', card);
  };

  // Formatter la valeur d'un champ
  const formatFieldValue = (fieldName: string, value: any) => {
    if (value === null || value === undefined) {
      return null;
    }

    // Formattage spécial pour certains types de champs
    switch (fieldName) {
      case 'created_at':
      case 'updated_at':
        return new Date(value).toLocaleDateString('fr-FR');

      case 'priority':
        const priorityColors: Record<string, string> = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          urgent: 'bg-red-100 text-red-800',
        };
        const priorityLabels: Record<string, string> = {
          low: 'Basse',
          medium: 'Moyenne',
          high: 'Haute',
          urgent: 'Urgente',
        };
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[value] || priorityColors.medium}`}>
            {priorityLabels[value] || value}
          </span>
        );

      case 'status':
        const statusColors: Record<string, string> = {
          todo: 'bg-gray-100 text-gray-800',
          in_progress: 'bg-blue-100 text-blue-800',
          review: 'bg-yellow-100 text-yellow-800',
          done: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || statusColors.todo}`}>
            {value}
          </span>
        );

      case 'assignee':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
              {typeof value === 'string' ? value.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="text-sm text-gray-700">{value}</span>
          </div>
        );

      default:
        return value;
    }
  };

  // Obtenir les champs à afficher sur la carte
  const getDisplayFields = () => {
    // Champs prioritaires pour l'affichage sur la carte
    const priorityFields = ['title', 'name', 'subject', 'summary', 'description'];
    const secondaryFields = ['priority', 'status', 'assignee', 'due_date', 'created_at'];

    const displayFields: any[] = [];

    // Chercher un champ de titre principal
    for (const field of priorityFields) {
      if (card[field] && card[field].toString().trim()) {
        displayFields.push({ name: field, value: card[field], priority: 'high' });
        break;
      }
    }

    // Ajouter des champs secondaires
    for (const field of secondaryFields) {
      if (card[field] && card[field].toString().trim()) {
        displayFields.push({ name: field, value: card[field], priority: 'medium' });
        // Limiter à 3 champs secondaires
        if (displayFields.filter(f => f.priority === 'medium').length >= 3) {
          break;
        }
      }
    }

    return displayFields;
  };

  const displayFields = getDisplayFields();
  const titleField = displayFields.find(f => f.priority === 'high');
  const secondaryFields = displayFields.filter(f => f.priority === 'medium');

  // Classes CSS dynamiques
  const cardClasses = [
    'bg-white',
    'border',
    'rounded-lg',
    'shadow-sm',
    'p-3',
    'cursor-pointer',
    'hover:shadow-md',
    'transition-shadow',
    'duration-200',
    compact ? 'p-2' : 'p-3',
    readonly ? 'cursor-default' : 'cursor-pointer hover:border-blue-300',
  ].join(' ');

  const titleClasses = [
    'font-medium',
    'text-gray-900',
    'mb-2',
    compact ? 'text-sm mb-1' : 'text-base mb-2',
  ].join(' ');

  return (
    <div
      className={cardClasses}
      draggable={!readonly}
      onDragStart={handleDragStart}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
    >
      {/* Actions de la carte (coin supérieur droit) */}
      {!readonly && (
        <div className="flex justify-end mb-2">
          <div className="flex space-x-1">
            <button
              onClick={handleEditClick}
              className="p-1 text-gray-400 hover:text-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Modifier"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1 text-gray-400 hover:text-red-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Supprimer"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={handleActionsClick}
              className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Plus d'actions"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ID de la carte (coin supérieur gauche) */}
      {card.id && (
        <div className="text-xs text-gray-400 mb-2">
          #{card.id}
        </div>
      )}

      {/* Titre principal */}
      {titleField && (
        <div className={titleClasses}>
          {formatFieldValue(titleField.name, titleField.value)}
        </div>
      )}

      {/* Champs secondaires */}
      {secondaryFields.length > 0 && (
        <div className="space-y-2">
          {secondaryFields.map((field) => {
            const formattedValue = formatFieldValue(field.name, field.value);
            if (!formattedValue) return null;

            return (
              <div key={field.name} className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">
                  {field.name.replace('_', ' ')}:
                </span>
                <div className="text-xs text-gray-700">
                  {formattedValue}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Description courte si disponible */}
      {card.description && typeof card.description === 'string' && (
        <div className="mt-2 text-xs text-gray-600 line-clamp-2">
          {card.description}
        </div>
      )}

      {/* Tags si disponibles */}
      {card.tags && Array.isArray(card.tags) && card.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Date de mise à jour */}
      {card.updated_at && (
        <div className="mt-2 text-xs text-gray-400">
          Mis à jour {new Date(card.updated_at).toLocaleDateString('fr-FR')}
        </div>
      )}
    </div>
  );
};

export default KanbanViewCard;
