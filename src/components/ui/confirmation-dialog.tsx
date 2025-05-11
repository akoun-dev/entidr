import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  isProcessing?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

/**
 * Composant de dialogue de confirmation réutilisable
 * Utilisé pour confirmer des actions importantes comme la suppression, l'activation, etc.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  cancelLabel = 'Annuler',
  variant = 'default',
  isProcessing = false,
  icon,
  onConfirm,
  onCancel,
  children,
}: ConfirmationDialogProps) {
  // Gérer l'annulation
  const handleCancel = () => {
    onOpenChange(false);
    if (onCancel) onCancel();
  };

  // Déterminer l'icône à afficher
  const actionIcon = icon || (variant === 'destructive' ? <Trash2 className="h-4 w-4 mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {children && <div className="py-4">{children}</div>}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                {actionIcon}
                {actionLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmationDialog;
