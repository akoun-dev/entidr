import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EntidrViewProps, EntidrViewState } from '../../../types/entidr-view';
import { KanbanViewHeader } from './KanbanViewHeader';
import { KanbanViewBoard } from './KanbanViewBoard';
import { KanbanViewCard } from './KanbanViewCard';
import { KanbanViewColumn } from './KanbanViewColumn';

/**
 * Props étendues pour le composant KanbanView
 */
export interface KanbanViewProps extends EntidrViewProps {
  /** État actuel de la vue */
  viewState: EntidrViewState;
  /** Données filtrées */
  filteredData: any[];
  /** Données paginées */
  paginatedData: any[];
}

/**
 * Composant KanbanView - Vue Kanban
 * Affiche les données sous forme de tableau Kanban avec colonnes et cartes glissables
 */
export const KanbanView: React.FC<KanbanViewProps> = ({
  view,
  viewState,
  filteredData,
  paginatedData,
  securityContext,
  readonly = false,
  compact = false,
  height,
  width,
  className,
  style,
  onEvent,
  callbacks,
}) => {
  // État local du Kanban
  const [columns, setColumns] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [draggedCard, setDraggedCard] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialiser les colonnes et les cartes
  useEffect(() => {
    // Déterminer le champ de statut pour le Kanban
    const statusField = view.fields.find(field =>
      field.widget === 'SELECT' || field.widget === 'RADIO'
    );

    if (!statusField) {
      console.error('KanbanView nécessite un champ SELECT ou RADIO pour le statut');
      return;
    }

    // Créer les colonnes à partir des options du champ de statut
    const kanbanColumns = statusField.options?.map((option: any, index: number) => ({
      id: option.value,
      title: option.label,
      description: option.description || '',
      order: index,
      color: option.color || '#6B7280',
      icon: option.icon,
      cardCount: 0,
    })) || [];

    // Organiser les cartes par colonne
    const cardsByColumn: Record<string, any[]> = {};
    kanbanColumns.forEach(column => {
      cardsByColumn[column.id] = [];
    });

    // Répartir les données dans les colonnes
    filteredData.forEach(item => {
      const status = item[statusField.name];
      if (status && cardsByColumn[status]) {
        cardsByColumn[status].push({
          ...item,
          columnId: status,
        });
      }
    });

    // Mettre à jour les compteurs de cartes
    const columnsWithCounts = kanbanColumns.map(column => ({
      ...column,
      cardCount: cardsByColumn[column.id].length,
    }));

    // Aplatir toutes les cartes
    const allCards = Object.values(cardsByColumn).flat();

    setColumns(columnsWithCounts);
    setCards(allCards);
  }, [view.fields, filteredData]);

  // Gérer le début du glisser-déposer
  const handleDragStart = useCallback((card: any, e: React.DragEvent) => {
    setDraggedCard(card);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);

    // Ajouter un effet visuel
    e.currentTarget.classList.add('opacity-50');
  }, []);

  // Gérer le survol pendant le glisser
  const handleDragOver = useCallback((columnId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  // Gérer la sortie du survol
  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  // Gérer le dépôt
  const handleDrop = useCallback((columnId: string, e: React.DragEvent) => {
    e.preventDefault();

    if (draggedCard && draggedCard.columnId !== columnId) {
      // Mettre à jour la colonne de la carte
      const updatedCards = cards.map(card =>
        card.id === draggedCard.id
          ? { ...card, columnId }
          : card
      );

      setCards(updatedCards);

      // Mettre à jour les compteurs
      const updatedColumns = columns.map(column => ({
        ...column,
        cardCount: updatedCards.filter(card => card.columnId === column.id).length,
      }));

      setColumns(updatedColumns);

      // Notifier le parent du changement
      const statusField = view.fields.find(field =>
        field.widget === 'SELECT' || field.widget === 'RADIO'
      );

      if (statusField) {
        onEvent('cardMove', {
          cardId: draggedCard.id,
          fromColumn: draggedCard.columnId,
          toColumn: columnId,
          field: statusField.name,
        });
      }
    }

    setDragOverColumn(null);
    setIsDragging(false);
    setDraggedCard(null);

    // Retirer l'effet visuel
    e.currentTarget.classList.remove('opacity-50');
  }, [draggedCard, cards, columns, view.fields, onEvent]);

  // Gérer la fin du glisser
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedCard(null);
    setDragOverColumn(null);

    // Retirer tous les effets visuels
    document.querySelectorAll('.opacity-50').forEach(el => {
      el.classList.remove('opacity-50');
    });
  }, []);

  // Gérer le clic sur une carte
  const handleCardClick = useCallback((card: any) => {
    onEvent('cardClick', card);
  }, [onEvent]);

  // Gérer le double-clic sur une carte
  const handleCardDoubleClick = useCallback((card: any) => {
    onEvent('cardDoubleClick', card);
    if (!readonly) {
      onEvent('edit', card);
    }
  }, [onEvent, readonly]);

  // Gérer le clic sur le bouton d'ajout de carte
  const handleAddCard = useCallback((columnId: string) => {
    if (!readonly) {
      onEvent('addCard', { columnId });
    }
  }, [onEvent, readonly]);

  // Gérer le clic sur le bouton de configuration
  const handleConfigClick = useCallback(() => {
    onEvent('config', null);
  }, [onEvent]);

  // Obtenir les cartes pour une colonne
  const getCardsForColumn = useCallback((columnId: string) => {
    return cards.filter(card => card.columnId === columnId);
  }, [cards]);

  // Classes CSS dynamiques
  const containerClasses = [
    'entidr-kanban-view',
    'flex',
    'flex-col',
    'h-full',
    compact ? 'compact' : '',
    className || '',
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'flex-1',
    'overflow-hidden',
    'flex',
    'flex-col',
  ].join(' ');

  return (
    <div
      className={containerClasses}
      style={{
        height,
        width,
        ...style,
      }}
    >
      {/* En-tête du Kanban */}
      <KanbanViewHeader
        view={view}
        totalCards={cards.length}
        readonly={readonly}
        loading={viewState.loading}
        error={viewState.error}
        onConfig={handleConfigClick}
        onEvent={onEvent}
      />

      {/* Contenu principal */}
      <div className={contentClasses}>
        {/* Tableau Kanban */}
        <KanbanViewBoard
          columns={columns}
          isDragging={isDragging}
          dragOverColumn={dragOverColumn}
          compact={compact}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onAddCard={handleAddCard}
          onEvent={onEvent}
        >
          {columns.map((column) => (
            <KanbanViewColumn
              key={column.id}
              column={column}
              isDragOver={dragOverColumn === column.id}
              readonly={readonly}
              compact={compact}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onAddCard={handleAddCard}
              onEvent={onEvent}
            >
              {getCardsForColumn(column.id).map((card) => (
                <KanbanViewCard
                  key={card.id}
                  card={card}
                  readonly={readonly}
                  compact={compact}
                  onDragStart={handleDragStart}
                  onClick={handleCardClick}
                  onDoubleClick={handleCardDoubleClick}
                  onEvent={onEvent}
                />
              ))}
            </KanbanViewColumn>
          ))}
        </KanbanViewBoard>
      </div>
    </div>
  );
};

export default KanbanView;
