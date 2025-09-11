import React, { useState, useCallback } from 'react';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { Button } from '../ui/button';
import { AlertTriangle, Trash2, Check, X, Info } from 'lucide-react';
import type { ActionConfig } from './ActionButton';

/**
 * Templates de confirmation prédéfinis
 */
export interface ConfirmationTemplate {
  /** Identifiant du template */
  id: string;

  /** Titre par défaut */
  defaultTitle: string;

  /** Message par défaut */
  defaultMessage: string;

  /** Icône par défaut */
  defaultIcon?: React.ReactNode;

  /** Variante par défaut */
  defaultVariant?: 'default' | 'destructive';

  /** Texte du bouton d'action par défaut */
  defaultActionLabel?: string;

  /** Conditions d'application du template */
  conditions?: {
    /** Types d'action concernés */
    actionTypes?: string[];
    /** Modèles concernés */
    models?: string[];
    /** Actions destructives */
    destructiveOnly?: boolean;
  };
}

/**
 * Configuration de la confirmation d'action
 */
export interface ActionConfirmationConfig {
  /** Configuration de l'action */
  action: ActionConfig;

  /** Templates de confirmation disponibles */
  templates?: ConfirmationTemplate[];

  /** Message de confirmation personnalisé */
  message?: string;

  /** Titre de confirmation personnalisé */
  title?: string;

  /** Icône personnalisée */
  icon?: React.ReactNode;

  /** Variante personnalisée */
  variant?: 'default' | 'destructive';

  /** Texte du bouton d'action personnalisé */
  actionLabel?: string;

  /** Texte du bouton d'annulation personnalisé */
  cancelLabel?: string;

  /** Afficher les détails de l'action */
  showDetails?: boolean;

  /** Afficher l'historique des confirmations */
  showHistory?: boolean;

  /** Confirmation en plusieurs étapes */
  multiStep?: boolean;

  /** Étapes de confirmation supplémentaires */
  additionalSteps?: Array<{
    title: string;
    message: string;
    input?: {
      type: 'text' | 'checkbox' | 'select';
      label: string;
      required: boolean;
      options?: Array<{ value: string; label: string }>;
    };
  }>;

  /** Délai de réflexion (ms) */
  reflectionDelay?: number;

  /** Nécessite une saisie de confirmation */
  requireConfirmationInput?: boolean;

  /** Texte de confirmation à saisir */
  confirmationInputText?: string;
}

/**
 * Élément d'historique de confirmation
 */
export interface ConfirmationHistoryItem {
  /** Timestamp de la confirmation */
  timestamp: Date;

  /** Action confirmée */
  action: ActionConfig;

  /** Utilisateur ayant confirmé */
  user?: string;

  /** Résultat de la confirmation */
  result: 'confirmed' | 'cancelled';

  /** Détails supplémentaires */
  details?: any;
}

/**
 * Props du composant ActionConfirmation
 */
export interface ActionConfirmationProps {
  /** Configuration de la confirmation */
  config: ActionConfirmationConfig;

  /** Handler de confirmation */
  onConfirm?: (action: ActionConfig, additionalData?: any) => void | Promise<void>;

  /** Handler d'annulation */
  onCancel?: (action: ActionConfig) => void;

  /** Handler d'étape de confirmation */
  onStepChange?: (currentStep: number, totalSteps: number) => void;

  /** Historique des confirmations */
  history?: ConfirmationHistoryItem[];

  /** Contrôles ouverts */
  open: boolean;

  /** Contrôles de fermeture */
  onOpenChange: (open: boolean) => void;

  /** Classes CSS supplémentaires */
  className?: string;
}

/**
 * Templates de confirmation par défaut
 */
const DEFAULT_TEMPLATES: ConfirmationTemplate[] = [
  {
    id: 'destructive',
    defaultTitle: 'Confirmation requise',
    defaultMessage: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
    defaultIcon: <Trash2 className="h-4 w-4" />,
    defaultVariant: 'destructive' as const,
    defaultActionLabel: 'Confirmer',
    conditions: {
      destructiveOnly: true
    }
  },
  {
    id: 'create',
    defaultTitle: 'Créer un élément',
    defaultMessage: 'Êtes-vous sûr de vouloir créer cet élément ?',
    defaultIcon: <Check className="h-4 w-4" />,
    defaultVariant: 'default' as const,
    defaultActionLabel: 'Créer',
    conditions: {
      actionTypes: ['CREATE']
    }
  },
  {
    id: 'update',
    defaultTitle: 'Modifier un élément',
    defaultMessage: 'Êtes-vous sûr de vouloir modifier cet élément ?',
    defaultIcon: <Info className="h-4 w-4" />,
    defaultVariant: 'default' as const,
    defaultActionLabel: 'Modifier',
    conditions: {
      actionTypes: ['UPDATE']
    }
  },
  {
    id: 'delete',
    defaultTitle: 'Supprimer un élément',
    defaultMessage: 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
    defaultIcon: <Trash2 className="h-4 w-4" />,
    defaultVariant: 'destructive' as const,
    defaultActionLabel: 'Supprimer',
    conditions: {
      actionTypes: ['DELETE']
    }
  },
  {
    id: 'batch',
    defaultTitle: 'Action groupée',
    defaultMessage: 'Cette action affectera plusieurs éléments. Êtes-vous sûr de vouloir continuer ?',
    defaultIcon: <AlertTriangle className="h-4 w-4" />,
    defaultVariant: 'destructive' as const,
    defaultActionLabel: 'Exécuter',
    conditions: {
      actionTypes: ['BATCH']
    }
  }
];

/**
 * Composant de confirmation d'action avec templates et fonctionnalités avancées
 */
export function ActionConfirmation({
  config,
  onConfirm,
  onCancel,
  onStepChange,
  history = [],
  open,
  onOpenChange,
  className = ''
}: ActionConfirmationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [reflectionTime, setReflectionTime] = useState(0);
  const [canConfirm, setCanConfirm] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');

  const { action } = config;
  const templates = config.templates || DEFAULT_TEMPLATES;

  // Calculer le nombre total d'étapes
  const totalSteps = config.multiStep
    ? 1 + (config.additionalSteps?.length || 0)
    : 1;

  // Trouver le template approprié
  const getTemplate = useCallback(() => {
    return templates.find(template => {
      const conditions = template.conditions;

      if (!conditions) return true;

      // Vérifier le type d'action
      if (conditions.actionTypes && !conditions.actionTypes.includes(action.type)) {
        return false;
      }

      // Vérifier le modèle
      if (conditions.models && action.model && !conditions.models.includes(action.model)) {
        return false;
      }

      // Vérifier si l'action est destructive
      if (conditions.destructiveOnly && !action.isDestructive) {
        return false;
      }

      return true;
    }) || templates[0]; // Fallback au premier template
  }, [templates, action.type, action.model, action.isDestructive]);

  const template = getTemplate();

  // Obtenir le titre final
  const getTitle = useCallback(() => {
    return config.title || action.confirmationTitle || template.defaultTitle;
  }, [config.title, action.confirmationTitle, template.defaultTitle]);

  // Obtenir le message final
  const getMessage = useCallback(() => {
    return config.message || action.confirmationMessage || template.defaultMessage;
  }, [config.message, action.confirmationMessage, template.defaultMessage]);

  // Obtenir l'icône finale
  const getIcon = useCallback(() => {
    return config.icon || action.icon || template.defaultIcon;
  }, [config.icon, action.icon, template.defaultIcon]);

  // Obtenir la variante finale
  const getVariant = useCallback(() => {
    return config.variant || (action.isDestructive ? 'destructive' : 'default') || template.defaultVariant;
  }, [config.variant, action.isDestructive, template.defaultVariant]);

  // Obtenir le label du bouton d'action
  const getActionLabel = useCallback(() => {
    return config.actionLabel || action.label || template.defaultActionLabel || 'Confirmer';
  }, [config.actionLabel, action.label, template.defaultActionLabel]);

  // Gérer le délai de réflexion
  React.useEffect(() => {
    if (!open || !config.reflectionDelay) {
      setCanConfirm(true);
      return;
    }

    setCanConfirm(false);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setReflectionTime(elapsed);

      if (elapsed >= config.reflectionDelay!) {
        setCanConfirm(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [open, config.reflectionDelay]);

  // Vérifier si la saisie de confirmation est valide
  React.useEffect(() => {
    if (!config.requireConfirmationInput) {
      setCanConfirm(prev => prev);
      return;
    }

    const isValid = confirmationInput.toLowerCase() ===
      (config.confirmationInputText || 'confirmer').toLowerCase();

    setCanConfirm(prev => prev && isValid);
  }, [confirmationInput, config.requireConfirmationInput, config.confirmationInputText]);

  // Gérer la confirmation
  const handleConfirm = useCallback(async () => {
    try {
      if (onConfirm) {
        await onConfirm(action, {
          stepData,
          reflectionTime,
          confirmationInput
        });
      }

      // Réinitialiser l'état
      setCurrentStep(0);
      setStepData({});
      setReflectionTime(0);
      setConfirmationInput('');
      setCanConfirm(false);
    } catch (error) {
      console.error('Confirmation error:', error);
    }
  }, [action, onConfirm, stepData, reflectionTime, confirmationInput]);

  // Gérer l'annulation
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel(action);
    }

    // Réinitialiser l'état
    setCurrentStep(0);
    setStepData({});
    setReflectionTime(0);
    setConfirmationInput('');
    setCanConfirm(false);
  }, [action, onCancel]);

  // Gérer le changement d'étape
  const handleStepChange = useCallback((newStep: number) => {
    setCurrentStep(newStep);
    if (onStepChange) {
      onStepChange(newStep, totalSteps);
    }
  }, [onStepChange, totalSteps]);

  // Rendu des détails de l'action
  const renderActionDetails = () => {
    if (!config.showDetails) return null;

    return (
      <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
        <h4 className="text-sm font-medium">Détails de l'action</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-1 font-medium">{action.type}</span>
          </div>
          {action.model && (
            <div>
              <span className="text-muted-foreground">Modèle:</span>
              <span className="ml-1 font-medium">{action.model}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Destructive:</span>
            <span className="ml-1 font-medium">{action.isDestructive ? 'Oui' : 'Non'}</span>
          </div>
          {action.payload && (
            <div>
              <span className="text-muted-foreground">Payload:</span>
              <span className="ml-1 font-medium">
                {typeof action.payload === 'object'
                  ? JSON.stringify(action.payload).substring(0, 50) + '...'
                  : String(action.payload)
                }
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Rendu du délai de réflexion
  const renderReflectionDelay = () => {
    if (!config.reflectionDelay || reflectionTime >= config.reflectionDelay) return null;

    const remaining = config.reflectionDelay - reflectionTime;
    const seconds = Math.ceil(remaining / 1000);

    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Veuillez patienter {seconds} seconde{seconds > 1 ? 's' : ''} avant de confirmer...
          </span>
        </div>
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${(reflectionTime / config.reflectionDelay) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Rendu de la saisie de confirmation
  const renderConfirmationInput = () => {
    if (!config.requireConfirmationInput) return null;

    const requiredText = config.confirmationInputText || 'confirmer';
    const isValid = confirmationInput.toLowerCase() === requiredText.toLowerCase();

    return (
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium">
          Tapez "{requiredText}" pour confirmer:
        </label>
        <input
          type="text"
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={requiredText}
        />
        {!isValid && confirmationInput && (
          <p className="text-xs text-red-600">
            Le texte saisi ne correspond pas à "{requiredText}"
          </p>
        )}
      </div>
    );
  };

  // Rendu de l'historique
  const renderHistory = () => {
    if (!config.showHistory || history.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium">Historique des confirmations</h4>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {history.slice(-5).reverse().map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
              <div>
                <span className="font-medium">{item.action.label}</span>
                <span className="text-muted-foreground ml-2">
                  {item.timestamp.toLocaleString()}
                </span>
              </div>
              <div className={`flex items-center space-x-1 ${
                item.result === 'confirmed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.result === 'confirmed' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span>{item.result === 'confirmed' ? 'Confirmé' : 'Annulé'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={getTitle()}
      description={getMessage()}
      actionLabel={getActionLabel()}
      cancelLabel={config.cancelLabel || 'Annuler'}
      variant={getVariant()}
      isProcessing={!canConfirm}
      icon={getIcon()}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      {/* Contenu supplémentaire */}
      <div className={`space-y-4 ${className}`}>
        {renderActionDetails()}
        {renderReflectionDelay()}
        {renderConfirmationInput()}
        {renderHistory()}

        {/* Indicateur d'étape pour les confirmations multi-étapes */}
        {config.multiStep && totalSteps > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Étape {currentStep + 1} sur {totalSteps}</span>
            <div className="flex space-x-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ConfirmationDialog>
  );
}

export default ActionConfirmation;
