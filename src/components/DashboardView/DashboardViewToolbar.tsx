import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Settings,
  LayoutGrid,
  LayoutList,
  Save,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';

import type { DashboardWidget } from './DashboardView';

interface DashboardViewToolbarProps {
  onWidgetAdd: (widget: Omit<DashboardWidget, 'id'>) => void;
  onConfigModeToggle: () => void;
  isConfigMode: boolean;
  onLayoutChange?: (layout: 'grid' | 'free') => void;
  onExport?: () => void;
  onImport?: (config: any) => void;
  onReset?: () => void;
}

const widgetTypes = [
  {
    id: 'stats',
    name: 'Statistiques',
    description: 'Affiche des statistiques sous forme de cartes',
    icon: LayoutGrid,
  },
  {
    id: 'chart',
    name: 'Graphique',
    description: 'Affiche des données sous forme de graphiques',
    icon: LayoutList,
  },
  {
    id: 'table',
    name: 'Tableau',
    description: 'Affiche des données sous forme de tableau',
    icon: LayoutList,
  },
  {
    id: 'text',
    name: 'Texte',
    description: 'Affiche du contenu texte ou HTML',
    icon: LayoutList,
  },
  {
    id: 'metric',
    name: 'Métrique',
    description: 'Affiche une métrique principale avec tendance',
    icon: LayoutList,
  },
];

export const DashboardViewToolbar: React.FC<DashboardViewToolbarProps> = ({
  onWidgetAdd,
  onConfigModeToggle,
  isConfigMode,
  onLayoutChange,
  onExport,
  onImport,
  onReset,
}) => {
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetDescription, setWidgetDescription] = useState('');

  const handleAddWidget = () => {
    if (!selectedWidgetType || !widgetTitle) return;

    const widgetType = widgetTypes.find(wt => wt.id === selectedWidgetType);
    if (!widgetType) return;

    onWidgetAdd({
      title: widgetTitle,
      type: selectedWidgetType,
      content: (
        <div className="p-4">
          <h3 className="font-semibold">{widgetTitle}</h3>
          {widgetDescription && (
            <p className="text-sm text-muted-foreground mt-1">{widgetDescription}</p>
          )}
          <div className="mt-4 text-center text-muted-foreground">
            Contenu du widget {widgetType.name}
          </div>
        </div>
      ),
      position: { x: 0, y: 0, width: 4, height: 3 },
      config: {
        description: widgetDescription,
      },
    });

    // Reset form
    setSelectedWidgetType('');
    setWidgetTitle('');
    setWidgetDescription('');
    setIsAddWidgetOpen(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        onImport?.(config);
      } catch (error) {
        console.error('Erreur lors de l\'importation:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un widget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un widget</DialogTitle>
                <DialogDescription>
                  Choisissez le type de widget et configurez ses propriétés.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="widget-type">Type de widget</Label>
                  <Select value={selectedWidgetType} onValueChange={setSelectedWidgetType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de widget" />
                    </SelectTrigger>
                    <SelectContent>
                      {widgetTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="widget-title">Titre</Label>
                  <Input
                    id="widget-title"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    placeholder="Titre du widget"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="widget-description">Description</Label>
                  <Textarea
                    id="widget-description"
                    value={widgetDescription}
                    onChange={(e) => setWidgetDescription(e.target.value)}
                    placeholder="Description du widget (optionnel)"
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddWidget}
                    disabled={!selectedWidgetType || !widgetTitle}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {onLayoutChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Layout
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Type de layout</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onLayoutChange('grid')}>
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grille
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLayoutChange('free')}>
                  <LayoutList className="h-4 w-4 mr-2" />
                  Libre
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}

          {onImport && (
            <div className="relative">
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="import-config" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </label>
              </Button>
              <input
                id="import-config"
                type="file"
                accept=".json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImport}
              />
            </div>
          )}

          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}

          <Button
            variant={isConfigMode ? "default" : "outline"}
            size="sm"
            onClick={onConfigModeToggle}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
            {isConfigMode && <Badge className="ml-2">Actif</Badge>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewToolbar;
