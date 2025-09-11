/**
 * Types et interfaces pour le système de dashboard Entidr
 * Ces types définissent la structure des dashboards pour l'ERP Entidr
 */

import type { ComponentType } from 'react';
import type { DashboardWidget, DashboardConfig } from '../components/DashboardView/DashboardView';

export interface EntidrDashboardConfig {
  name: string;
  displayName: string;
  description?: string;
  layout: '1x1' | '2x2' | '3x3' | '4x4' | 'custom';
  widgets: EntidrDashboardWidget[];
  theme?: 'light' | 'dark' | 'auto';
  refreshInterval?: number; // en secondes
  autoRefresh?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  showControls?: boolean;
  showExport?: boolean;
  showPrint?: boolean;
  showSettings?: boolean;
  showHelp?: boolean;
  permissions?: string[];
  groups?: string[];
  users?: string[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrDashboardWidget {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: EntidrWidgetType;
  model: string;
  position: EntidrWidgetPosition;
  size: EntidrWidgetSize;
  config: EntidrWidgetConfig;
  data?: any;
  loading?: boolean;
  error?: any;
  visible?: boolean;
  collapsible?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  removable?: boolean;
  editable?: boolean;
  refreshable?: boolean;
  exportable?: boolean;
  printable?: boolean;
  permissions?: string[];
  groups?: string[];
  users?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EntidrWidgetType =
  | 'kpi'
  | 'chart'
  | 'list'
  | 'table'
  | 'calendar'
  | 'map'
  | 'gauge'
  | 'progress'
  | 'metric'
  | 'activity'
  | 'news'
  | 'weather'
  | 'clock'
  | 'counter'
  | 'timeline'
  | 'funnel'
  | 'heatmap'
  | 'scatter'
  | 'pie'
  | 'bar'
  | 'line'
  | 'area'
  | 'radar'
  | 'polar'
  | 'treemap'
  | 'sunburst'
  | 'sankey'
  | 'network'
  | 'wordcloud'
  | 'custom';

export interface EntidrWidgetPosition {
  x: number;
  y: number;
  z?: number; // pour le layering
}

export interface EntidrWidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface EntidrWidgetConfig {
  // Configuration générale
  title?: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  padding?: number;
  margin?: number;
  borderRadius?: number;
  boxShadow?: boolean;
  border?: boolean;

  // Configuration des données
  domain?: string;
  filters?: Record<string, any>;
  groups?: string[];
  sorts?: string[];
  limit?: number;
  offset?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  measure?: string;
  dimension?: string;

  // Configuration spécifique par type
  kpi?: EntidrKPIConfig;
  chart?: EntidrChartConfig;
  list?: EntidrListConfig;
  table?: EntidrTableConfig;
  calendar?: EntidrCalendarConfig;
  map?: EntidrMapConfig;
  gauge?: EntidrGaugeConfig;
  progress?: EntidrProgressConfig;
  metric?: EntidrMetricConfig;
  activity?: EntidrActivityConfig;
  news?: EntidrNewsConfig;
  custom?: EntidrCustomConfig;
}

export interface EntidrKPIConfig {
  value: string;
  label?: string;
  unit?: string;
  format?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  target?: number;
  comparison?: {
    value: number;
    label: string;
    period: string;
  };
  thresholds?: {
    warning?: number;
    danger?: number;
    success?: number;
  };
}

export interface EntidrChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'polar' | 'treemap' | 'heatmap' | 'funnel';
  xAxis?: any;
  yAxis?: any;
  series?: any;
  legend?: boolean;
  tooltip?: boolean;
  grid?: boolean;
  stacked?: boolean;
  normalized?: boolean;
  dataLabels?: boolean;
  animations?: boolean;
  responsive?: boolean;
  colors?: string[];
  markers?: boolean;
  curve?: 'linear' | 'monotone' | 'step' | 'basis' | 'cardinal';
  fill?: boolean;
  opacity?: number;
  barWidth?: number;
  barRadius?: number;
  pieInnerRadius?: number;
  pieOuterRadius?: number;
  piePadding?: number;
  heatmapColorScale?: string;
  heatmapIntensity?: number;
}

export interface EntidrListConfig {
  fields: string[];
  showHeader?: boolean;
  showFooter?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowSelection?: 'single' | 'multiple' | 'checkbox' | 'none';
  expandable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  virtual?: boolean;
  scroll?: {
    x?: number | true;
    y?: number | true;
  };
  actions?: EntidrListAction[];
  filters?: EntidrListFilter[];
  sorts?: EntidrListSort[];
}

export interface EntidrListAction {
  name: string;
  label?: string;
  icon?: string;
  type?: 'button' | 'dropdown' | 'menu';
  action?: string;
  method?: string;
  confirm?: string;
  invisible?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  sequence?: number;
}

export interface EntidrListFilter {
  field: string;
  operator: string;
  value: any;
  label?: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  options?: { label: string; value: any }[];
  placeholder?: string;
  invisible?: boolean;
  readonly?: boolean;
  required?: boolean;
  sequence?: number;
}

export interface EntidrListSort {
  field: string;
  direction: 'asc' | 'desc';
  label?: string;
  invisible?: boolean;
  readonly?: boolean;
  required?: boolean;
  sequence?: number;
}

export interface EntidrTableConfig {
  columns: EntidrTableColumn[];
  showHeader?: boolean;
  showFooter?: boolean;
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowSelection?: 'single' | 'multiple' | 'checkbox' | 'none';
  expandable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  virtual?: boolean;
  scroll?: {
    x?: number | true;
    y?: number | true;
  };
  summary?: boolean;
  sticky?: boolean;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
}

export interface EntidrTableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  resizable?: boolean;
  hidden?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  filters?: any;
  sorter?: any;
  onFilter?: (value: any, record: any) => boolean;
  onSort?: (a: any, b: any) => number;
}

export interface EntidrCalendarConfig {
  dateField?: string;
  startDate?: string;
  endDate?: string;
  title?: string;
  description?: string;
  color?: string;
  allDay?: string;
  mode?: 'month' | 'week' | 'day' | 'agenda';
  defaultMode?: string;
  firstDay?: number;
  height?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  slotDuration?: string;
  slotLabelInterval?: string;
  slotLabelFormat?: string;
  slotEventOverlap?: boolean;
  selectMirror?: boolean;
  selectOverlap?: boolean;
  eventOverlap?: boolean;
  eventConstraint?: any;
  eventResizable?: boolean;
  eventStartEditable?: boolean;
  eventDurationEditable?: boolean;
  eventResourceEditable?: boolean;
  eventDisplay?: 'auto' | 'block' | 'list-item' | 'background' | 'inverse-background';
  dayMaxEventRows?: number;
  dayMaxEvents?: number;
  moreLinkContent?: string;
  moreLinkClick?: string;
  navLinks?: boolean;
  headerToolbar?: any;
  footerToolbar?: any;
  views?: any;
}

export interface EntidrMapConfig {
  latitudeField?: string;
  longitudeField?: string;
  locationField?: string;
  titleField?: string;
  descriptionField?: string;
  colorField?: string;
  sizeField?: string;
  iconField?: string;
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showControls?: boolean;
  showScale?: boolean;
  showTraffic?: boolean;
  showTransit?: boolean;
  showBicycling?: boolean;
  showMarkers?: boolean;
  showHeatmap?: boolean;
  showClusters?: boolean;
  clusterRadius?: number;
  heatmapRadius?: number;
  heatmapOpacity?: number;
  markerIcon?: string;
  markerSize?: number;
  markerColor?: string;
  popupTemplate?: string;
  tooltipTemplate?: string;
}

export interface EntidrGaugeConfig {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  format?: string;
  precision?: number;
  color?: string;
  thresholds?: {
    warning?: number;
    danger?: number;
    success?: number;
  };
  segments?: {
    value: number;
    color: string;
    label?: string;
  }[];
  needle?: {
    color?: string;
    width?: number;
    length?: number;
  };
  ticks?: {
    count?: number;
    color?: string;
    width?: number;
    length?: number;
  };
  arc?: {
    width?: number;
    cornerRadius?: number;
    padding?: number;
  };
}

export interface EntidrProgressConfig {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  format?: string;
  precision?: number;
  color?: string;
  backgroundColor?: string;
  striped?: boolean;
  animated?: boolean;
  showInfo?: boolean;
  showPercentage?: boolean;
  showValue?: boolean;
  size?: 'small' | 'default' | 'large';
  shape?: 'circle' | 'line' | 'square';
  strokeWidth?: number;
  strokeColor?: string;
  trailColor?: string;
  trailWidth?: number;
}

export interface EntidrMetricConfig {
  value: number;
  label?: string;
  unit?: string;
  format?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  target?: number;
  comparison?: {
    value: number;
    label: string;
    period: string;
  };
  thresholds?: {
    warning?: number;
    danger?: number;
    success?: number;
  };
  size?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
}

export interface EntidrActivityConfig {
  model: string;
  titleField?: string;
  descriptionField?: string;
  dateField?: string;
  userField?: string;
  avatarField?: string;
  iconField?: string;
  colorField?: string;
  limit?: number;
  showAvatar?: boolean;
  showDate?: boolean;
  showUser?: boolean;
  showIcon?: boolean;
  showDescription?: boolean;
  dateFormat?: string;
  timeFormat?: string;
  groupBy?: 'date' | 'user' | 'type';
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  actions?: EntidrActivityAction[];
}

export interface EntidrActivityAction {
  name: string;
  label?: string;
  icon?: string;
  type?: 'button' | 'dropdown' | 'menu';
  action?: string;
  method?: string;
  confirm?: string;
  invisible?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  sequence?: number;
}

export interface EntidrNewsConfig {
  source?: string;
  category?: string;
  limit?: number;
  showImage?: boolean;
  showDate?: boolean;
  showSource?: boolean;
  showDescription?: boolean;
  dateFormat?: string;
  maxLength?: number;
  filters?: Record<string, any>;
  sortOrder?: 'asc' | 'desc';
  refreshInterval?: number;
}

export interface EntidrCustomConfig {
  component?: ComponentType<any>;
  props?: Record<string, any>;
  template?: string;
  script?: string;
  style?: string;
  data?: any;
  methods?: Record<string, Function>;
  computed?: Record<string, Function>;
  watch?: Record<string, Function>;
  mounted?: Function;
  updated?: Function;
  destroyed?: Function;
}

export interface EntidrDashboardBuilder {
  dashboard: EntidrDashboardConfig;
  availableWidgets: EntidrAvailableWidget[];
  selectedWidget?: EntidrDashboardWidget;
  isEditing?: boolean;
  isPreviewing?: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  maxWidgets?: number;
  permissions?: string[];
  groups?: string[];
  users?: string[];
}

export interface EntidrAvailableWidget {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: EntidrWidgetType;
  category: string;
  icon?: string;
  thumbnail?: string;
  preview?: string;
  config: EntidrWidgetConfig;
  permissions?: string[];
  groups?: string[];
  users?: string[];
  isDefault?: boolean;
  isSystem?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrDashboardTemplate {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  thumbnail?: string;
  preview?: string;
  config: EntidrDashboardConfig;
  permissions?: string[];
  groups?: string[];
  users?: string[];
  isDefault?: boolean;
  isPublic?: boolean;
  usageCount?: number;
  rating?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrDashboardLayout {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  layout: '1x1' | '2x2' | '3x3' | '4x4' | 'custom';
  grid: {
    columns: number;
    rows: number;
    gap: number;
    margin: number;
  };
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  permissions?: string[];
  groups?: string[];
  users?: string[];
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidrDashboardWidgetRenderer {
  type: EntidrWidgetType;
  component: ComponentType<EntidrWidgetRendererProps>;
  config?: any;
  defaultConfig?: EntidrWidgetConfig;
}

export interface EntidrWidgetRendererProps {
  widget: EntidrDashboardWidget;
  data?: any;
  loading?: boolean;
  error?: any;
  onRefresh?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onResize?: (size: EntidrWidgetSize) => void;
  onMove?: (position: EntidrWidgetPosition) => void;
  onConfigChange?: (config: EntidrWidgetConfig) => void;
  onExport?: (format: string) => void;
  onPrint?: () => void;
  context?: any;
  permissions?: any;
}

export interface EntidrDashboardEvent {
  type: 'widget_add' | 'widget_remove' | 'widget_update' | 'widget_move' | 'widget_resize' | 'widget_refresh' | 'widget_export' | 'widget_print' | 'dashboard_save' | 'dashboard_load' | 'dashboard_delete';
  dashboard: string;
  widget?: string;
  data?: any;
  timestamp: Date;
  user?: string;
}

export interface EntidrDashboardRegistry {
  [widgetType: string]: {
    component: ComponentType<EntidrWidgetRendererProps>;
    config?: any;
    defaultConfig?: EntidrWidgetConfig;
    available?: boolean;
    permissions?: string[];
  };
}

export interface EntidrDashboardSettings {
  // Configuration globale des dashboards
  defaultLayout: string;
  defaultTheme: 'light' | 'dark' | 'auto';
  defaultRefreshInterval: number;
  maxWidgets: number;
  maxDashboards: number;
  autoSave: boolean;
  autoRefresh: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Configuration des permissions
  allowPublicDashboards: boolean;
  allowSharedDashboards: boolean;
  allowTemplateSharing: boolean;
  requireApproval: boolean;

  // Configuration des performances
  enableCaching: boolean;
  cacheTimeout: number;
  enableLazyLoading: boolean;
  enableVirtualScrolling: boolean;

  // Configuration de l'export
  allowExport: boolean;
  exportFormats: string[];
  exportLimit: number;

  // Configuration de l'impression
  allowPrint: boolean;
  printFormat: string;
  printOrientation: 'portrait' | 'landscape';

  // Configuration des notifications
  enableNotifications: boolean;
  notificationTypes: string[];
  notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

/**
 * Interfaces d'intégration avec les composants DashboardView
 * Ces interfaces permettent la conversion entre les anciens et nouveaux formats
 */
export interface DashboardViewAdapter {
  /**
   * Convertir une configuration EntidrDashboardConfig en DashboardConfig
   */
  toDashboardViewConfig(entidrConfig: EntidrDashboardConfig): DashboardConfig;

  /**
   * Convertir une configuration DashboardConfig en EntidrDashboardConfig
   */
  fromDashboardViewConfig(dashboardConfig: DashboardConfig): EntidrDashboardConfig;

  /**
   * Convertir un widget EntidrDashboardWidget en DashboardWidget
   */
  toDashboardViewWidget(entidrWidget: EntidrDashboardWidget): DashboardWidget;

  /**
   * Convertir un widget DashboardWidget en EntidrDashboardWidget
   */
  fromDashboardViewWidget(dashboardWidget: DashboardWidget): EntidrDashboardWidget;
}

/**
 * Configuration pour l'intégration DashboardView
 */
export interface DashboardViewIntegrationConfig {
  /**
   * Utiliser les nouveaux composants DashboardView
   */
  enabled: boolean;

  /**
   * Layout par défaut pour les nouveaux dashboards
   */
  defaultLayout: 'grid' | 'free';

  /**
   * Thème par défaut
   */
  defaultTheme: {
    background?: string;
    widgetBackground?: string;
    textColor?: string;
    borderColor?: string;
  };

  /**
   * Types de widgets supportés
   */
  supportedWidgetTypes: EntidrWidgetType[];

  /**
   * Configuration du drag & drop
   */
  dragDropConfig: {
    enabled: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };

  /**
   * Configuration du redimensionnement
   */
  resizeConfig: {
    enabled: boolean;
    minSize: { width: number; height: number };
    maxSize: { width: number; height: number };
  };

  /**
   * Configuration de l'export
   */
  exportConfig: {
    enabled: boolean;
    formats: string[];
  };

  /**
   * Configuration de l'impression
   */
  printConfig: {
    enabled: boolean;
    format: string;
  };
}

/**
 * Événements spécifiques aux DashboardView
 */
export interface DashboardViewIntegrationEvent {
  type: 'dashboard_view_loaded' | 'dashboard_view_config_changed' | 'dashboard_view_widget_added' | 'dashboard_view_widget_removed' | 'dashboard_view_widget_updated' | 'dashboard_view_widget_resized' | 'dashboard_view_widget_moved';
  dashboardId: string;
  widgetId?: string;
  data?: any;
  timestamp: Date;
  userId?: string;
}

/**
 * Service d'intégration DashboardView
 */
export interface DashboardViewIntegrationService {
  /**
   * Initialiser l'intégration
   */
  initialize(config: DashboardViewIntegrationConfig): Promise<void>;

  /**
   * Convertir et charger un dashboard
   */
  loadDashboard(entidrConfig: EntidrDashboardConfig): Promise<DashboardConfig>;

  /**
   * Sauvegarder un dashboard au format Entidr
   */
  saveDashboard(dashboardConfig: DashboardConfig): Promise<EntidrDashboardConfig>;

  /**
   * Gérer les événements d'intégration
   */
  onEvent(event: DashboardViewIntegrationEvent): Promise<void>;

  /**
   * Vérifier si un widget est supporté
   */
  isWidgetSupported(widgetType: EntidrWidgetType): boolean;

  /**
   * Obtenir la configuration d'intégration
   */
  getConfig(): DashboardViewIntegrationConfig;

  /**
   * Mettre à jour la configuration d'intégration
   */
  updateConfig(config: Partial<DashboardViewIntegrationConfig>): Promise<void>;
}
