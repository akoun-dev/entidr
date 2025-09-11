import React from 'react';

/**
 * Props pour le composant KanbanViewColumn
 */
export interface KanbanViewColumnProps {
  /** Configuration de la colonne */
  column: any;
  /** La colonne est survolée pendant le glisser */
  isDragOver: boolean;
  /** Mode lecture seule */
  readonly?: boolean;
  /** Mode compact */
  compact?: boolean;
  /** Callback pour le survol pendant le glisser */
  onDragOver: (columnId: string, e: React.DragEvent) => void;
  /** Callback pour la sortie du survol */
  onDragLeave: () => void;
  /** Callback pour le dépôt */
  onDrop: (columnId: string, e: React.DragEvent) => void;
  /** Callback pour l'ajout de carte */
  onAddCard: (columnId: string) => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
  /** Enfants (cartes) */
  children?: React.ReactNode;
}

/**
 * Composant KanbanViewColumn - Colonne du Kanban
 * Affiche une colonne avec son en-tête et ses cartes
 */
export const KanbanViewColumn: React.FC<KanbanViewColumnProps> = ({
  column,
  isDragOver,
  readonly = false,
  compact = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddCard,
  onEvent,
  children,
}) => {
  // Gérer le clic sur le bouton d'ajout de carte
  const handleAddCardClick = () => {
    onAddCard(column.id);
  };

  // Gérer le clic sur le bouton de configuration de colonne
  const handleColumnConfigClick = () => {
    onEvent('columnConfig', { columnId: column.id });
  };

  // Classes CSS dynamiques
  const columnClasses = [
    'flex',
    'flex-col',
    'bg-white',
    'rounded-lg',
    'shadow-sm',
    'border',
    'w-80',
    'flex-shrink-0',
    compact ? 'w-64' : 'w-80',
    isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
  ].join(' ');

  const headerClasses = [
    'flex',
    'items-center',
    'justify-between',
    'p-3',
    'border-b',
    compact ? 'p-2' : 'p-3',
    isDragOver ? 'border-blue-200' : 'border-gray-200',
  ].join(' ');

  const titleClasses = [
    'flex',
    'items-center',
    'space-x-2',
    'font-medium',
    'text-gray-900',
  ].join(' ');

  const contentClasses = [
    'flex-1',
    'overflow-y-auto',
    'p-3',
    'space-y-3',
    compact ? 'p-2 space-y-2' : 'p-3 space-y-3',
  ].join(' ');

  const footerClasses = [
    'p-3',
    'border-t',
    compact ? 'p-2' : 'p-3',
    isDragOver ? 'border-blue-200' : 'border-gray-200',
  ].join(' ');

  // Obtenir la couleur de fond pour l'en-tête
  const getHeaderBgColor = () => {
    if (!column.color) return 'bg-gray-50';

    // Convertir la couleur hex en RGB pour l'opacité
    const hex = column.color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  return (
    <div
      className={columnClasses}
      onDragOver={(e) => onDragOver(column.id, e)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(column.id, e)}
    >
      {/* En-tête de la colonne */}
      <div
        className={headerClasses}
        style={{ backgroundColor: getHeaderBgColor() }}
      >
        <div className={titleClasses}>
          {/* Indicateur de couleur */}
          {column.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}

          {/* Icône si disponible */}
          {column.icon && (
            <span className="text-gray-600">{column.icon}</span>
          )}

          {/* Titre */}
          <span>{column.title}</span>

          {/* Compteur de cartes */}
          <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {column.cardCount}
          </span>
        </div>

        {/* Actions de la colonne */}
        <div className="flex items-center space-x-1">
          {/* Bouton de configuration */}
          <button
            onClick={handleColumnConfigClick}
            className="p-1 text-gray-400 hover:text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Configurer la colonne"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description de la colonne */}
      {column.description && (
        <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
          {column.description}
        </div>
      )}

      {/* Contenu de la colonne (cartes) */}
      <div className={contentClasses}>
        {children}

        {/* Message si aucune carte */}
        {React.Children.count(children) === 0 && (
          <div className="text-center py-8 text-gray-400">
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Aucune carte</p>
            {!readonly && (
              <p className="text-xs mt-1">Cliquez sur + pour ajouter</p>
            )}
          </div>
        )}
      </div>

      {/* Pied de la colonne */}
      <div className={footerClasses}>
        {!readonly && (
          <button
            onClick={handleAddCardClick}
            className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une carte
          </button>
        )}

        {readonly && (
          <div className="text-center text-xs text-gray-500">
            Mode lecture seule
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanViewColumn;
