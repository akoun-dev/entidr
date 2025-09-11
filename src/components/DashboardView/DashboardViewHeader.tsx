import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Save, Edit2 } from 'lucide-react';

interface DashboardViewHeaderProps {
  title: string;
  description?: string;
  editable: boolean;
  isConfigMode: boolean;
  onConfigModeToggle: () => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export const DashboardViewHeader: React.FC<DashboardViewHeaderProps> = ({
  title,
  description,
  editable,
  isConfigMode,
  onConfigModeToggle,
  onTitleChange,
  onDescriptionChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description || '');

  const handleSave = () => {
    onTitleChange?.(editedTitle);
    onDescriptionChange?.(editedDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedDescription(description || '');
    setIsEditing(false);
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="space-y-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Titre du tableau de bord"
                  className="text-lg font-semibold"
                />
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Description du tableau de bord"
                  className="min-h-[60px] text-sm"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            )}

            {editable && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConfigMode && (
            <Badge variant="secondary" className="animate-pulse">
              Mode configuration
            </Badge>
          )}

          {editable && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Paramètres du tableau de bord</DialogTitle>
                  <DialogDescription>
                    Configurez les options générales de votre tableau de bord.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Mode configuration
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={onConfigModeToggle}
                        variant={isConfigMode ? "default" : "outline"}
                        size="sm"
                      >
                        {isConfigMode ? 'Désactiver' : 'Activer'}
                      </Button>
                      {isConfigMode && (
                        <Badge variant="destructive">Actif</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Statistiques
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Widgets: {0}</div>
                      <div>Layout: Grid</div>
                      <div>Dernière mise à jour: Maintenant</div>
                      <div>Mode: {isConfigMode ? 'Configuration' : 'Affichage'}</div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardViewHeader;
