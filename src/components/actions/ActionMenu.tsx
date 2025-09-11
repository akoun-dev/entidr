import React, { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from '../ui/dropdown-menu';
import { Button, ButtonProps } from '../ui/button';
import { MoreHorizontal, ChevronRight, AlertTriangle, Check } from 'lucide-react';
import type { ActionConfig } from './ActionButton';
import { ActionButton } from './ActionButton';
import { useActionPermissions } from './useActionPermissions';

/**
 * Configuration d'un groupe d'actions
 */
export interface ActionGroup {
  /** Identifiant du groupe */
  id: string;

  /** Libellé du groupe */
  label: string;

  /** Description du groupe */
  description?: string;

  /** Actions du groupe */
  actions: ActionConfig[];

  /** Icône du groupe */
  icon?: React.ReactNode;

  /** Groupe désactivé */
  disabled?: boolean;

  /** Ordre d'affichage */
  order?: number;
}

/**
 * Props du composant ActionMenu
 */
export interface ActionMenuProps extends Omit<ButtonProps, 'onClick'> {
  /** Actions à afficher dans le menu */
  actions: ActionConfig[];

  /** Groupes d'actions */
  groups?: ActionGroup[];

  /** Handler de clic sur une action */
  onActionClick?: (action: ActionConfig, event: React.MouseEvent) => void | Promise<void>;

  /** Handler de confirmation d'action */
  onActionConfirm?: (action: ActionConfig) => void | Promise<void>;

  /** Handler d'annulation d'action */
  onActionCancel?: (action: ActionConfig) => void;

  /** Désactiver la vérification des permissions */
  bypassPermissions?: boolean;

  /** Afficher les actions désactivées */
  showDisabledActions?: boolean;

  /** Afficher le statut des permissions */
  showPermissionStatus?: boolean;

  /** Afficher les séparateurs de groupe */
  showGroupSeparators?: boolean;

  /** Texte pour les actions désactivées */
  disabledActionText?: string;

  /** Texte pour les actions sans permission */
  noPermissionText?: string;

  /** Alignement du menu */
  align?: 'start' | 'center' | 'end';

  /** Position du menu */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant de menu d'actions avec gestion des permissions et groupement
 */
export function ActionMenu({
  actions,
  groups = [],
  onActionClick,
  onActionConfirm,
  onActionCancel,
  bypassPermissions = false,
  showDisabledActions = true,
  showPermissionStatus = false,
  showGroupSeparators = true,
  disabledActionText = 'Action non disponible',
  noPermissionText = 'Permission requise',
  align = 'end',
  side = 'bottom',
  className = '',
  children,
  ...buttonProps
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filtrer et organiser les actions
  const getOrganizedActions = useCallback(() => {
    const allActions = [...actions];

    // Ajouter les actions des groupes
    groups.forEach(group => {
      if (!group.disabled) {
        allActions.push(...group.actions);
      }
    });

    // Filtrer les actions si nécessaire
    const filteredActions = showDisabledActions
      ? allActions
      : allActions.filter(action => !action.disabled);

    return {
      standaloneActions: actions.filter(action =>
        !groups.some(group => group.actions.includes(action))
      ),
      groupedActions: groups,
      allActions: filteredActions
    };
  }, [actions, groups, showDisabledActions]);

  const { standaloneActions, groupedActions } = getOrganizedActions();

  // Gérer le clic sur une action
  const handleActionClick = useCallback(async (action: ActionConfig, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      if (onActionClick) {
        await onActionClick(action, event);
      }

      // Fermer le menu après l'action
      setIsOpen(false);
    } catch (error) {
      console.error('Action click error:', error);
    }
  }, [onActionClick]);

  // Gérer la confirmation d'action
  const handleActionConfirm = useCallback(async (action: ActionConfig) => {
    try {
      if (onActionConfirm) {
        await onActionConfirm(action);
      }
    } catch (error) {
      console.error('Action confirm error:', error);
    }
  }, [onActionConfirm]);

  // Gérer l'annulation d'action
  const handleActionCancel = useCallback((action: ActionConfig) => {
    if (onActionCancel) {
      onActionCancel(action);
    }
  }, [onActionCancel]);

  // Rendu d'une action dans le menu
  const renderMenuItem = useCallback((action: ActionConfig) => {
    // Vérifier les permissions
    const { hasPermission, isChecking } = useActionPermissions({
      action,
      bypass: bypassPermissions
    });

    const isActionDisabled = action.disabled || (!hasPermission && !bypassPermissions) || isChecking;

    return (
      <DropdownMenuItem
        key={action.id}
        disabled={isActionDisabled}
        className={`flex items-center space-x-2 ${
          !hasPermission && !bypassPermissions ? 'opacity-50' : ''
        }`}
        onClick={(e) => handleActionClick(action, e)}
        title={action.description || action.label}
      >
        {action.icon && <span className="w-4 h-4">{action.icon}</span>}
        <span className="flex-1">{action.label}</span>

        {/* Indicateurs d'état */}
        {showPermissionStatus && (
          <span className="flex items-center space-x-1">
            {isChecking && (
              <span className="w-3 h-3">
                <div className="animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            )}
            {!isChecking && !hasPermission && !bypassPermissions && (
              <AlertTriangle className="w-3 h-3 text-yellow-500" />
            )}
            {!isChecking && hasPermission && (
              <Check className="w-3 h-3 text-green-500" />
            )}
          </span>
        )}

        {/* Texte d'état désactivé */}
        {isActionDisabled && (
          <span className="text-xs text-muted-foreground">
            {!hasPermission && !bypassPermissions ? noPermissionText : disabledActionText}
          </span>
        )}
      </DropdownMenuItem>
    );
  }, [handleActionClick, bypassPermissions, showPermissionStatus, noPermissionText, disabledActionText]);

  // Rendu d'un groupe d'actions
  const renderGroup = useCallback((group: ActionGroup) => {
    if (group.disabled) return null;

    // Vérifier si le groupe a des actions visibles
    const visibleActions = group.actions.filter(action =>
      showDisabledActions || !action.disabled
    );

    if (visibleActions.length === 0) return null;

    return (
      <React.Fragment key={group.id}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center space-x-2">
            {group.icon && <span className="w-4 h-4">{group.icon}</span>}
            <span>{group.label}</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {group.actions.map(renderMenuItem)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {showGroupSeparators && <DropdownMenuSeparator />}
      </React.Fragment>
    );
  }, [renderMenuItem, showDisabledActions, showGroupSeparators]);

  // Rendu du contenu du menu
  const renderMenuContent = () => (
    <DropdownMenuContent align={align} side={side} className="w-56">
      {/* Actions autonomes */}
      {standaloneActions.length > 0 && (
        <DropdownMenuGroup>
          {standaloneActions.map(renderMenuItem)}
        </DropdownMenuGroup>
      )}

      {/* Séparateur si nécessaire */}
      {standaloneActions.length > 0 && groupedActions.length > 0 && showGroupSeparators && (
        <DropdownMenuSeparator />
      )}

      {/* Groupes d'actions */}
      {groupedActions.map(renderGroup)}

      {/* Message si aucune action disponible */}
      {standaloneActions.length === 0 && groupedActions.length === 0 && (
        <div className="p-2 text-center text-sm text-muted-foreground">
          Aucune action disponible
        </div>
      )}
    </DropdownMenuContent>
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          {...buttonProps}
        >
          {children || <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>

      {renderMenuContent()}
    </DropdownMenu>
  );
}

export default ActionMenu;
