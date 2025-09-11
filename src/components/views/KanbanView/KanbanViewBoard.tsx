import React from 'react';

/**
 * Props pour le composant KanbanViewBoard
 */
export interface KanbanViewBoardProps {
  /** Colonnes du Kanban */
  columns: any[];
  /** État de glisser en cours */
  isDragging: boolean;
  /** Colonne survolée pendant le glisser */
  dragOverColumn: string | null;
  /** Mode compact */
  compact?: boolean;
  /** Callback pour le survol pendant le glisser */
  onDragOver: (columnId: string, e: React.DragEvent) => void;
  /** Callback pour la sortie du survol */
  onDragLeave: () => void;
  /** Callback pour le dépôt */
  onDrop: (columnId: string, e: React.DragEvent) => void;
  /** Callback pour la fin du glisser */
  onDragEnd: () => void;
  /** Callback pour l'ajout de carte */
  onAddCard: (columnId: string) => void;
  /** Callback pour les événements */
  onEvent: (eventName: string, data: any) => void;
  /** Enfants (colonnes) */
  children?: React.ReactNode;
}

/**
 * Composant KanbanViewBoard - Tableau Kanban
 * Conteneur principal pour les colonnes du Kanban
 */
export const KanbanViewBoard: React.FC<KanbanViewBoardProps> = ({
  columns,
  isDragging,
  dragOverColumn,
  compact = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onAddCard,
  onEvent,
  children,
}) => {
  // Gérer le dépôt sur le tableau (zone vide)
  const handleBoardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragEnd();
  };

  // Gérer le survol sur le tableau
  const handleBoardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Classes CSS dynamiques
  const boardClasses = [
    'flex-1',
    'overflow-x-auto',
    'overflow-y-hidden',
    'bg-gray-100',
    'p-4',
    compact ? 'p-2' : '',
    isDragging ? 'bg-gray-200' : '',
  ].join(' ');

  const columnsContainerClasses = [
    'flex',
    'space-x-4',
    'h-full',
    'min-w-max',
  ].join(' ');

  return (
    <div
      className={boardClasses}
      onDragOver={handleBoardDragOver}
      onDrop={handleBoardDrop}
    >
      <div className={columnsContainerClasses}>
        {children}
      </div>

      {/* Message d'aide si aucune colonne */}
      {columns.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <svg className="h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2M9 17a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Configuration du Kanban requise
          </h3>
          <p className="text-sm text-center max-w-md">
            Pour utiliser la vue Kanban, vous devez configurer un champ de type SELECT ou RADIO
            avec des options pour définir les colonnes.
          </p>
          <button
            onClick={() => onEvent('config', null)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Configurer la vue
          </button>
        </div>
      )}

      {/* Indicateur de glisser-déposer */}
      {isDragging && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Glissez vers une colonne pour déplacer</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanViewBoard;
