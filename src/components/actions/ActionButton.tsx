import React, { useState, useCallback } from 'react';
import { Button, ButtonProps } from '../ui/button';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { Loader2, AlertTriangle, Trash2, Check } from 'lucide-react';
import type { PermissionLevel } from '../../core/auth/types';
import { useActionPermissions } from './useActionPermissions';

/**
 * Configuration d'une action
 */
export interface ActionConfig {
  /** Identifiant unique de l'action */
  id: string;

  /** Libellé de l'action */
  label: string;

  /** Description de l'action */
  description?: string;

  /** Type d'action (détermine le comportement) */
  type: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'CUSTOM' | 'EXPORT' | 'IMPORT' | 'BATCH';

  /** Modèle concerné par l'action */
  model?: string;

  /** Permissions requises */
  permissions?: PermissionLevel[];

  /** Action nécessite une confirmation */
  requiresConfirmation?: boolean;

  /** Message de confirmation personnalisé */
  confirmationMessage?: string;

  /** Titre de confirmation personnalisé */
  confirmationTitle?: string;

  /** Action est destructive */
  isDestructive?: boolean;

  /** Icône de l'action */
  icon?: React.ReactNode;

  /** Variante du bouton */
  variant?: ButtonProps['variant'];

  /** Taille du bouton */
  size?: ButtonProps['size'];

  /** Action désactivée */
  disabled?: boolean;

  /** Action en cours de traitement */
  loading?: boolean;

  /** Données supplémentaires pour l'action */
  payload?: any;

  /** Handler d'action personnalisé */
  onAction?: (config: ActionConfig, payload?: any) => Promise<void> | void;
}

/**
 * Props du composant ActionButton
 */
export interface ActionButtonProps extends Omit<ButtonProps, 'onClick' | 'disabled' | 'loading'> {
  /** Configuration de l'action */
  action: ActionConfig;

  /** Handler de clic */
  onClick?: (action: ActionConfig, event: React.MouseEvent) => void | Promise<void>;

  /** Handler de confirmation */
  onConfirm?: (action: ActionConfig) => void | Promise<void>;

  /** Handler d'annulation */
  onCancel?: (action: ActionConfig) => void;

  /** Désactiver la vérification des permissions */
  bypassPermissions?: boolean;

  /** Forcer l'état de chargement */
  forceLoading?: boolean;

  /** Afficher l'état des permissions */
  showPermissionStatus?: boolean;

  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Composant de bouton d'action avec gestion des permissions et confirmations
 */
export function ActionButton({
  action,
  onClick,
  onConfirm,
  onCancel,
  bypassPermissions = false,
  forceLoading = false,
  showPermissionStatus = false,
  className = '',
  children,
  ...buttonProps
}: ActionButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Vérification des permissions
  const { hasPermission, isChecking, permissionError } = useActionPermissions({
    action,
    bypass: bypassPermissions
  });

  // Déterminer si le bouton est désactivé
  const isDisabled =
    action.disabled ||
    forceLoading ||
    isProcessing ||
    (!bypassPermissions && !hasPermission) ||
    (isChecking && !bypassPermissions);

  // Déterminer la variante du bouton
  const buttonVariant = action.variant || (action.isDestructive ? 'destructive' : 'default');

  // Gérer le clic sur le bouton
  const handleClick = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDisabled) return;

    try {
      // Appeler le handler de clic externe
      if (onClick) {
        await onClick(action, event);
      }

      // Si l'action nécessite une confirmation
      if (action.requiresConfirmation) {
        setShowConfirmation(true);
        return;
      }

      // Exécuter l'action
      await executeAction();
    } catch (error) {
      console.error('Action error:', error);
    }
  }, [action, onClick, isDisabled]);

  // Exécuter l'action
  const executeAction = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Appeler le handler de confirmation externe
      if (onConfirm) {
        await onConfirm(action);
      }

      // Appeler le handler d'action personnalisé
      if (action.onAction) {
        await action.onAction(action, action.payload);
      }
    } catch (error) {
      console.error('Action execution error:', error);
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  }, [action, onConfirm]);

  // Gérer l'annulation de la confirmation
  const handleCancel = useCallback(() => {
    setShowConfirmation(false);
    if (onCancel) {
      onCancel(action);
    }
  }, [action, onCancel]);

  // Déterminer l'icône à afficher
  const getIcon = () => {
    if (forceLoading || isProcessing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    if (action.isDestructive && !action.icon) {
      return <Trash2 className="h-4 w-4" />;
    }

    if (isChecking && !bypassPermissions) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    return action.icon;
  };

  // Texte pour le bouton de confirmation
  const getConfirmationText = () => {
    if (action.confirmationMessage) {
      return action.confirmationMessage;
    }

    const messages = {
      CREATE: `Êtes-vous sûr de vouloir créer cet élément ?`,
      UPDATE: `Êtes-vous sûr de vouloir modifier cet élément ?`,
      DELETE: `Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.`,
      EXPORT: `Êtes-vous sûr de vouloir exporter ces données ?`,
      IMPORT: `Êtes-vous sûr de vouloir importer ces données ?`,
      BATCH: `Êtes-vous sûr de vouloir exécuter cette action sur plusieurs éléments ?`,
      CUSTOM: `Êtes-vous sûr de vouloir exécuter cette action ?`,
      READ: ''
    };

    return messages[action.type] || `Êtes-vous sûr de vouloir continuer ?`;
  };

  // Titre pour la confirmation
  const getConfirmationTitle = () => {
    if (action.confirmationTitle) {
      return action.confirmationTitle;
    }

    const titles = {
      CREATE: 'Créer un élément',
      UPDATE: 'Modifier un élément',
      DELETE: 'Supprimer un élément',
      EXPORT: 'Exporter des données',
      IMPORT: 'Importer des données',
      BATCH: 'Exécuter une action groupée',
      CUSTOM: 'Confirmer l\'action',
      READ: ''
    };

    return titles[action.type] || 'Confirmer l\'action';
  };

  // Rendu du statut de permission
  const renderPermissionStatus = () => {
    if (!showPermissionStatus || bypassPermissions) return null;

    if (isChecking) {
      return (
        <span className="ml-2 text-xs text-muted-foreground">
          Vérification des permissions...
        </span>
      );
    }

    if (permissionError) {
      return (
        <span className="ml-2 text-xs text-red-600" title={permissionError}>
          <AlertTriangle className="h-3 w-3 inline" />
          Permission refusée
        </span>
      );
    }

    if (hasPermission) {
      return (
        <span className="ml-2 text-xs text-green-600" title="Permission accordée">
          <Check className="h-3 w-3 inline" />
          Autorisé
        </span>
      );
    }

    return (
      <span className="ml-2 text-xs text-red-600" title="Permission requise">
        <AlertTriangle className="h-3 w-3 inline" />
        Non autorisé
      </span>
    );
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={action.size}
        disabled={isDisabled}
        onClick={handleClick}
        className={`${className} ${!hasPermission && !bypassPermissions ? 'opacity-50' : ''}`}
        title={action.description || action.label}
        {...buttonProps}
      >
        {getIcon()}
        {children || action.label}
        {renderPermissionStatus()}
      </Button>

      {/* Dialogue de confirmation */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title={getConfirmationTitle()}
        description={getConfirmationText()}
        actionLabel={action.label}
        variant={action.isDestructive ? 'destructive' : 'default'}
        isProcessing={isProcessing}
        icon={action.isDestructive ? <Trash2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        onConfirm={executeAction}
        onCancel={handleCancel}
      />
    </>
  );
}

export default ActionButton;
