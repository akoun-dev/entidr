import React, { useState, useCallback } from 'react';
import { DashboardViewHeader } from './DashboardViewHeader';
import { DashboardViewToolbar } from './DashboardViewToolbar';
import { DashboardViewGrid } from './DashboardViewGrid';
import { DashboardViewConfig } from './DashboardViewConfig';
import { useToast } from '@/hooks/use-toast';

export interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  content: React.ReactNode;
  position: { x: number; y: number; width: number; height: number };
  config?: Record<string, any>;
}

export interface DashboardConfig {
  title: string;
  description?: string;
  layout: 'grid' | 'free';
  widgets: DashboardWidget[];
  theme: {
    background?: string;
    widgetBackground?: string;
    textColor?: string;
    borderColor?: string;
  };
}

interface DashboardViewProps {
  initialConfig?: Partial<DashboardConfig>;
  onConfigChange?: (config: DashboardConfig) => void;
  editable?: boolean;
}

const defaultConfig: DashboardConfig = {
  title: 'Tableau de bord',
  layout: 'grid',
  widgets: [],
  theme: {
    background: '#f8fafc',
    widgetBackground: '#ffffff',
    textColor: '#1e293b',
    borderColor: '#e2e8f0',
  },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialConfig = {},
  onConfigChange,
  editable = false,
}) => {
  const [config, setConfig] = useState<DashboardConfig>({
    ...defaultConfig,
    ...initialConfig,
    widgets: initialConfig.widgets || [],
  });
  const [isConfigMode, setIsConfigMode] = useState(false);
  const { toast } = useToast();

  const handleConfigUpdate = useCallback((newConfig: DashboardConfig) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    toast({
      title: 'Configuration mise à jour',
      description: 'Les modifications ont été sauvegardées avec succès.',
    });
  }, [onConfigChange, toast]);

  const handleWidgetAdd = useCallback((widget: Omit<DashboardWidget, 'id'>) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const newConfig = {
      ...config,
      widgets: [...config.widgets, newWidget],
    };
    handleConfigUpdate(newConfig);
  }, [config, handleConfigUpdate]);

  const handleWidgetUpdate = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    const newWidgets = config.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    const newConfig = { ...config, widgets: newWidgets };
    handleConfigUpdate(newConfig);
  }, [config, handleConfigUpdate]);

  const handleWidgetRemove = useCallback((widgetId: string) => {
    const newWidgets = config.widgets.filter(widget => widget.id !== widgetId);
    const newConfig = { ...config, widgets: newWidgets };
    handleConfigUpdate(newConfig);
    toast({
      title: 'Widget supprimé',
      description: 'Le widget a été retiré du tableau de bord.',
    });
  }, [config, handleConfigUpdate, toast]);

  const handleWidgetReorder = useCallback((widgets: DashboardWidget[]) => {
    const newConfig = { ...config, widgets };
    handleConfigUpdate(newConfig);
  }, [config, handleConfigUpdate]);

  return (
    <div className="flex flex-col h-full bg-background">
      <DashboardViewHeader
        title={config.title}
        description={config.description}
        editable={editable}
        onConfigModeToggle={() => setIsConfigMode(!isConfigMode)}
        isConfigMode={isConfigMode}
      />

      {editable && (
        <DashboardViewToolbar
          onWidgetAdd={handleWidgetAdd}
          onConfigModeToggle={() => setIsConfigMode(!isConfigMode)}
          isConfigMode={isConfigMode}
        />
      )}

      <div className="flex-1 relative overflow-hidden">
        {isConfigMode ? (
          <DashboardViewConfig
            config={config}
            onConfigChange={handleConfigUpdate}
            onClose={() => setIsConfigMode(false)}
          />
        ) : (
          <DashboardViewGrid
            widgets={config.widgets}
            layout={config.layout}
            theme={config.theme}
            editable={editable}
            onWidgetUpdate={handleWidgetUpdate}
            onWidgetRemove={handleWidgetRemove}
            onWidgetReorder={handleWidgetReorder}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardView;
