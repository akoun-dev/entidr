import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Zap, Palette, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import type { ThemeConfig } from './types';

/**
 * Interface pour les configurations dynamiques de thème
 */
interface DynamicThemeConfig {
  id: string;
  name: string;
  baseTheme: string;
  variations: ThemeVariation[];
  transitionConfig: TransitionConfig;
  autoMode: AutoThemeMode;
  triggers: ThemeTrigger[];
}

/**
 * Interface pour les variations de thème
 */
interface ThemeVariation {
  id: string;
  name: string;
  description: string;
  modifications: ThemeModification[];
  conditions: VariationCondition[];
}

/**
 * Interface pour les modifications de thème
 */
interface ThemeModification {
  type: 'color' | 'font' | 'spacing' | 'border' | 'shadow' | 'layout';
  target: string;
  value: any;
  operation: 'replace' | 'adjust' | 'multiply' | 'add';
}

/**
 * Interface pour les conditions de variation
 */
interface VariationCondition {
  type: 'time' | 'date' | 'season' | 'weather' | 'user_activity' | 'device_type';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
  value: any;
}

/**
 * Interface pour la configuration des transitions
 */
interface TransitionConfig {
  enabled: boolean;
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'rotate' | 'morph';
  duration: number; // en millisecondes
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  stagger: number; // délai entre les animations d'éléments
  customCSS?: string;
}

/**
 * Interface pour le mode automatique
 */
interface AutoThemeMode {
  enabled: boolean;
  strategy: 'scheduled' | 'conditional' | 'adaptive' | 'ai_powered';
  schedule?: ThemeSchedule[];
  rules?: AutoThemeRule[];
  learningEnabled: boolean;
  userFeedback: boolean;
}

/**
 * Interface pour la planification des thèmes
 */
interface ThemeSchedule {
  id: string;
  name: string;
  themeId: string;
  time: string; // format HH:mm
  days: string[]; // ['monday', 'tuesday', ...]
  enabled: boolean;
  priority: number;
}

/**
 * Interface pour les règles automatiques
 */
interface AutoThemeRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
}

/**
 * Interface pour les conditions de règle
 */
interface RuleCondition {
  type: 'time_range' | 'date_range' | 'season' | 'weather' | 'location' | 'user_mood' | 'device_battery';
  operator: 'equals' | 'between' | 'greater_than' | 'less_than';
  value: any;
  weight: number; // importance de la condition
}

/**
 * Interface pour les actions de règle
 */
interface RuleAction {
  type: 'apply_theme' | 'adjust_brightness' | 'change_contrast' | 'modify_colors';
  target: string;
  value: any;
  transition?: boolean;
}

/**
 * Interface pour les déclencheurs de thème
 */
interface ThemeTrigger {
  id: string;
  name: string;
  type: 'manual' | 'automatic' | 'event_based' | 'api_call';
  event: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
}

/**
 * Interface pour les conditions de déclencheur
 */
interface TriggerCondition {
  type: 'user_action' | 'system_event' | 'external_api' | 'time_based';
  parameter: string;
  operator: string;
  value: any;
}

/**
 * Interface pour les actions de déclencheur
 */
interface TriggerAction {
  type: 'switch_theme' | 'modify_theme' | 'send_notification' | 'log_event';
  target: string;
  parameters: Record<string, any>;
}

/**
 * Interface pour les métriques de performance
 */
interface PerformanceMetrics {
  themeSwitchTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  userSatisfaction: number;
}

/**
 * Composant pour le système de thèmes dynamiques
 */
export function DynamicThemeSystem() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dynamicConfigs, setDynamicConfigs] = useState<DynamicThemeConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<DynamicThemeConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);

  // Simuler des données initiales
  useEffect(() => {
    const mockConfigs: DynamicThemeConfig[] = [
      {
        id: '1',
        name: 'Thème Adaptatif Journalier',
        baseTheme: 'light',
        variations: [
          {
            id: 'morning',
            name: 'Matin',
            description: 'Couleurs chaudes et lumineuses pour le matin',
            modifications: [
              {
                type: 'color',
                target: 'primary',
                value: '#f59e0b',
                operation: 'replace'
              },
              {
                type: 'color',
                target: 'background',
                value: '#fef3c7',
                operation: 'replace'
              }
            ],
            conditions: [
              {
                type: 'time',
                operator: 'between',
                value: { start: '06:00', end: '12:00' }
              }
            ]
          },
          {
            id: 'afternoon',
            name: 'Après-midi',
            description: 'Couleurs neutres et professionnelles',
            modifications: [
              {
                type: 'color',
                target: 'primary',
                value: '#3b82f6',
                operation: 'replace'
              }
            ],
            conditions: [
              {
                type: 'time',
                operator: 'between',
                value: { start: '12:00', end: '18:00' }
              }
            ]
          },
          {
            id: 'evening',
            name: 'Soir',
            description: 'Couleurs douces et relaxantes',
            modifications: [
              {
                type: 'color',
                target: 'primary',
                value: '#8b5cf6',
                operation: 'replace'
              },
              {
                type: 'color',
                target: 'background',
                value: '#f3e8ff',
                operation: 'replace'
              }
            ],
            conditions: [
              {
                type: 'time',
                operator: 'between',
                value: { start: '18:00', end: '22:00' }
              }
            ]
          },
          {
            id: 'night',
            name: 'Nuit',
            description: 'Mode sombre avec couleurs réduites',
            modifications: [
              {
                type: 'color',
                target: 'primary',
                value: '#6366f1',
                operation: 'replace'
              },
              {
                type: 'color',
                target: 'background',
                value: '#1e1b4b',
                operation: 'replace'
              }
            ],
            conditions: [
              {
                type: 'time',
                operator: 'between',
                value: { start: '22:00', end: '06:00' }
              }
            ]
          }
        ],
        transitionConfig: {
          enabled: true,
          type: 'fade',
          duration: 500,
          easing: 'ease-in-out',
          stagger: 50
        },
        autoMode: {
          enabled: true,
          strategy: 'conditional',
          learningEnabled: true,
          userFeedback: true,
          rules: [
            {
              id: 'rule1',
              name: 'Détection automatique',
              description: 'Change le thème en fonction de l\'heure',
              conditions: [
                {
                  type: 'time_range',
                  operator: 'between',
                  value: { start: '06:00', end: '22:00' },
                  weight: 1.0
                }
              ],
              actions: [
                {
                  type: 'apply_theme',
                  target: 'auto',
                  value: 'light',
                  transition: true
                }
              ],
              priority: 1,
              enabled: true
            }
          ]
        },
        triggers: [
          {
            id: 'trigger1',
            name: 'Changement manuel',
            type: 'manual',
            event: 'user_theme_change',
            conditions: [],
            actions: [
              {
                type: 'switch_theme',
                target: 'current',
                parameters: { theme: 'user_selected' }
              }
            ]
          }
        ]
      }
    ];

    setDynamicConfigs(mockConfigs);
    setSelectedConfig(mockConfigs[0]);

    // Simuler des métriques de performance
    const mockMetrics: PerformanceMetrics = {
      themeSwitchTime: 320,
      renderTime: 45,
      memoryUsage: 12.5,
      cpuUsage: 8.3,
      userSatisfaction: 4.7
    };
    setPerformanceMetrics(mockMetrics);
  }, []);

  // Simuler le système dynamique en action
  useEffect(() => {
    if (!isPlaying || !selectedConfig) return;

    const interval = setInterval(() => {
      // Simuler un changement de thème basé sur l'heure actuelle
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Trouver la variation appropriée
      const currentVariation = selectedConfig.variations.find(variation => {
        const condition = variation.conditions[0];
        if (condition.type === 'time' && condition.operator === 'between') {
          const { start, end } = condition.value;
          return currentTime >= start && currentTime <= end;
        }
        return false;
      });

      if (currentVariation) {
        // Mettre à jour le thème de prévisualisation
        const baseThemeConfig: ThemeConfig = {
          id: 'dynamic-preview',
          name: 'Dynamic Preview',
          version: '1.0.0',
          type: 'dynamic',
          detectionMode: 'automatic',
          colors: {
            light: {
              primary: '#3b82f6',
              secondary: '#64748b',
              background: '#ffffff',
              muted: '#f1f5f9',
              accent: '#f8fafc',
              destructive: '#ef4444',
              success: '#22c55e',
              warning: '#f59e0b',
              info: '#3b82f6'
            },
            dark: {
              primary: '#60a5fa',
              secondary: '#94a3b8',
              background: '#0f172a',
              muted: '#1e293b',
              accent: '#334155',
              destructive: '#f87171',
              success: '#4ade80',
              warning: '#facc15',
              info: '#60a5fa'
            }
          },
          fonts: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Georgia', 'serif'],
            mono: ['JetBrains Mono', 'monospace'],
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
            '7xl': '4.5rem',
            '8xl': '6rem'
          },
          spacing: {
            px: '1px',
            '0': '0',
            '0.5': '0.125rem',
            '1': '0.25rem',
            '1.5': '0.375rem',
            '2': '0.5rem',
            '2.5': '0.625rem',
            '3': '0.75rem',
            '3.5': '0.875rem',
            '4': '1rem',
            '5': '1.25rem',
            '6': '1.5rem',
            '7': '1.75rem',
            '8': '2rem',
            '9': '2.25rem',
            '10': '2.5rem',
            '11': '2.75rem',
            '12': '3rem',
            '14': '3.5rem',
            '16': '4rem',
            '20': '5rem',
            '24': '6rem',
            '28': '7rem',
            '32': '8rem',
            '36': '9rem',
            '40': '10rem',
            '44': '11rem',
            '48': '12rem',
            '52': '13rem',
            '56': '14rem',
            '60': '15rem',
            '64': '16rem',
            '72': '18rem',
            '80': '20rem',
            '96': '24rem'
          },
          borders: {
            widthNone: '0',
            widthSm: '1px',
            widthMd: '2px',
            widthLg: '4px',
            widthXl: '8px',
            styleNone: 'none',
            styleSolid: 'solid',
            styleDashed: 'dashed',
            styleDotted: 'dotted',
            styleDouble: 'double',
            radiusNone: '0',
            radiusSm: '0.125rem',
            radiusMd: '0.25rem',
            radiusLg: '0.375rem',
            radiusXl: '0.5rem',
            radius2xl: '0.75rem',
            radius3xl: '1rem',
            radiusFull: '9999px'
          },
          shadows: {
            none: 'none',
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
            coloredPrimary: '0 4px 6px -1px hsl(var(--primary) / 0.3)',
            coloredSecondary: '0 4px 6px -1px hsl(var(--secondary) / 0.3)',
            coloredSuccess: '0 4px 6px -1px hsl(var(--success) / 0.3)',
            coloredWarning: '0 4px 6px -1px hsl(var(--warning) / 0.3)',
            coloredError: '0 4px 6px -1px hsl(var(--error) / 0.3)',
            coloredInfo: '0 4px 6px -1px hsl(var(--info) / 0.3)'
          },
          animations: {
            themeSwitch: {
              duration: 300,
              easing: 'ease-in-out',
              type: 'fade'
            },
            component: {
              duration: 200,
              easing: 'ease-out',
              stagger: 50
            }
          },
          performance: {
            lazyLoading: true,
            cacheSize: 50,
            preload: true,
            optimize: true
          },
          accessibility: {
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium',
            lineHeight: 'normal'
          }
        };

        // Appliquer les modifications de la variation
        let modifiedConfig = { ...baseThemeConfig };

        currentVariation.modifications.forEach(mod => {
          if (mod.type === 'color' && mod.operation === 'replace') {
            modifiedConfig = {
              ...modifiedConfig,
              colors: {
                ...modifiedConfig.colors,
                light: {
                  ...modifiedConfig.colors.light,
                  [mod.target]: mod.value
                }
              }
            };
          }
        });

        setPreviewTheme(modifiedConfig);
      }
    }, 2000); // Vérifier toutes les 2 secondes

    return () => clearInterval(interval);
  }, [isPlaying, selectedConfig]);

  // Obtenir la variation actuelle
  const getCurrentVariation = useCallback(() => {
    if (!selectedConfig) return null;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return selectedConfig.variations.find(variation => {
      const condition = variation.conditions[0];
      if (condition.type === 'time' && condition.operator === 'between') {
        const { start, end } = condition.value;
        return currentTime >= start && currentTime <= end;
      }
      return false;
    });
  }, [selectedConfig]);

  const currentVariation = getCurrentVariation();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles size={24} />
            Système de Thèmes Dynamiques
          </h2>
          <p className="text-muted-foreground">
            Créez des thèmes qui s'adaptent automatiquement aux conditions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? "default" : "outline"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Démarrer'}
          </Button>

          <Button variant="outline" onClick={() => setIsPlaying(false)}>
            <RotateCcw size={16} className="mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
          <TabsTrigger value="transitions">Transitions</TabsTrigger>
          <TabsTrigger value="automation">Automatisation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statut actuel */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du Système</CardTitle>
              <CardDescription>
                État actuel du système de thèmes dynamiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isPlaying ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="text-lg font-semibold">
                    {isPlaying ? 'Actif' : 'Inactif'}
                  </div>
                  <div className="text-sm text-muted-foreground">Système</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold">
                    {selectedConfig?.variations.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Variations</div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold">
                    {currentVariation?.name || 'Aucune'}
                  </div>
                  <div className="text-sm text-muted-foreground">Variation actuelle</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prévisualisation en temps réel */}
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation en Temps Réel</CardTitle>
              <CardDescription>
                {currentVariation
                  ? `Variation actuelle: ${currentVariation.name} - ${currentVariation.description}`
                  : 'Aucune variation active'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewTheme && (
                <div
                  className="p-8 rounded-lg border transition-all duration-500"
                  style={{
                    backgroundColor: previewTheme.colors.light.background,
                    color: previewTheme.colors.light.foreground || '#0f172a',
                    fontFamily: previewTheme.fonts.sans?.[0]
                  }}
                >
                  <h3
                    className="text-2xl font-bold mb-4 transition-colors duration-500"
                    style={{ color: previewTheme.colors.light.primary }}
                  >
                    {currentVariation?.name || 'Thème Dynamique'}
                  </h3>
                  <p
                    className="mb-6 transition-colors duration-500"
                    style={{ color: previewTheme.colors.light.secondary }}
                  >
                    {currentVariation?.description || 'Ceci est un aperçu du thème dynamique en action.'}
                  </p>

                  <div className="flex gap-4">
                    <button
                      className="px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: previewTheme.colors.light.primary }}
                    >
                      Action Principale
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg border-2 font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: previewTheme.colors.light.primary,
                        color: previewTheme.colors.light.primary
                      }}
                    >
                      Action Secondaire
                    </button>
                  </div>

                  <div className="mt-6 p-4 rounded-lg transition-colors duration-500" style={{ backgroundColor: previewTheme.colors.light.muted }}>
                    <p className="text-sm" style={{ color: previewTheme.colors.light.foreground || '#0f172a' }}>
                      Zone de contenu avec arrière-plan adaptatif.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration sélectionnée */}
          {selectedConfig && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedConfig.name}</CardTitle>
                <CardDescription>
                  Configuration du système de thèmes dynamiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Thème de base</Label>
                      <div className="text-lg">{selectedConfig.baseTheme}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stratégie automatique</Label>
                      <div className="text-lg">{selectedConfig.autoMode.strategy}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={selectedConfig.autoMode.enabled} disabled />
                    <Label>Mode automatique activé</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={selectedConfig.transitionConfig.enabled} disabled />
                    <Label>Transitions activées</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="variations" className="space-y-6">
          {selectedConfig && (
            <div className="grid gap-4">
              {selectedConfig.variations.map((variation) => (
                <Card key={variation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{variation.name}</h3>
                        <p className="text-muted-foreground">{variation.description}</p>
                      </div>
                      {currentVariation?.id === variation.id && (
                        <Badge variant="default">Actif</Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Conditions</Label>
                        <div className="space-y-2">
                          {variation.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                              <Badge variant="outline">{condition.type}</Badge>
                              <span>{condition.operator}</span>
                              <span className="font-mono">
                                {typeof condition.value === 'object'
                                  ? `${condition.value.start} - ${condition.value.end}`
                                  : condition.value
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Modifications</Label>
                        <div className="space-y-2">
                          {variation.modifications.map((mod, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                              <Badge variant="outline">{mod.type}</Badge>
                              <span>{mod.target}</span>
                              <span>{mod.operation}</span>
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: mod.value }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transitions" className="space-y-6">
          {selectedConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Configuration des Transitions</CardTitle>
                <CardDescription>
                  Personnalisez les animations de transition entre les thèmes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Type d'animation</Label>
                      <Select
                        value={selectedConfig.transitionConfig.type}
                        onValueChange={(value) => {
                          if (selectedConfig) {
                            setSelectedConfig({
                              ...selectedConfig,
                              transitionConfig: {
                                ...selectedConfig.transitionConfig,
                                type: value as any
                              }
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Fondu</SelectItem>
                          <SelectItem value="slide">Glissement</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="flip">Retournement</SelectItem>
                          <SelectItem value="rotate">Rotation</SelectItem>
                          <SelectItem value="morph">Morphose</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Fonction d'assouplissement</Label>
                      <Select
                        value={selectedConfig.transitionConfig.easing}
                        onValueChange={(value) => {
                          if (selectedConfig) {
                            setSelectedConfig({
                              ...selectedConfig,
                              transitionConfig: {
                                ...selectedConfig.transitionConfig,
                                easing: value as any
                              }
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linéaire</SelectItem>
                          <SelectItem value="ease">Ease</SelectItem>
                          <SelectItem value="ease-in">Ease In</SelectItem>
                          <SelectItem value="ease-out">Ease Out</SelectItem>
                          <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                          <SelectItem value="bounce">Rebond</SelectItem>
                          <SelectItem value="elastic">Élastique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Durée: {selectedConfig.transitionConfig.duration}ms
                    </Label>
                    <Slider
                      value={[selectedConfig.transitionConfig.duration]}
                      onValueChange={([value]) => {
                        if (selectedConfig) {
                          setSelectedConfig({
                            ...selectedConfig,
                            transitionConfig: {
                              ...selectedConfig.transitionConfig,
                              duration: value
                            }
                          });
                        }
                      }}
                      min={100}
                      max={2000}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Délai d'échelonnement: {selectedConfig.transitionConfig.stagger}ms
                    </Label>
                    <Slider
                      value={[selectedConfig.transitionConfig.stagger]}
                      onValueChange={([value]) => {
                        if (selectedConfig) {
                          setSelectedConfig({
                            ...selectedConfig,
                            transitionConfig: {
                              ...selectedConfig.transitionConfig,
                              stagger: value
                            }
                          });
                        }
                      }}
                      min={0}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedConfig.transitionConfig.enabled}
                      onValueChange={(checked) => {
                        if (selectedConfig) {
                          setSelectedConfig({
                            ...selectedConfig,
                            transitionConfig: {
                              ...selectedConfig.transitionConfig,
                              enabled: checked
                            }
                          });
                        }
                      }}
                    />
                    <Label>Activer les transitions</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {selectedConfig && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mode Automatique</CardTitle>
                  <CardDescription>
                    Configuration du comportement automatique du système
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Stratégie</Label>
                        <Select
                          value={selectedConfig.autoMode.strategy}
                          onValueChange={(value) => {
                            if (selectedConfig) {
                              setSelectedConfig({
                                ...selectedConfig,
                                autoMode: {
                                  ...selectedConfig.autoMode,
                                  strategy: value as any
                                }
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Planifié</SelectItem>
                            <SelectItem value="conditional">Conditionnel</SelectItem>
                            <SelectItem value="adaptive">Adaptatif</SelectItem>
                            <SelectItem value="ai_powered">Alimenté par IA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedConfig.autoMode.enabled}
                            onValueChange={(checked) => {
                              if (selectedConfig) {
                                setSelectedConfig({
                                  ...selectedConfig,
                                  autoMode: {
                                    ...selectedConfig.autoMode,
                                    enabled: checked
                                  }
                                });
                              }
                            }}
                          />
                          <Label>Mode automatique activé</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedConfig.autoMode.learningEnabled}
                            onValueChange={(checked) => {
                              if (selectedConfig) {
                                setSelectedConfig({
                                  ...selectedConfig,
                                  autoMode: {
                                    ...selectedConfig.autoMode,
                                    learningEnabled: checked
                                  }
                                });
                              }
                            }}
                          />
                          <Label>Apprentissage activé</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedConfig.autoMode.userFeedback}
                            onValueChange={(checked) => {
                              if (selectedConfig) {
                                setSelectedConfig({
                                  ...selectedConfig,
                                  autoMode: {
                                    ...selectedConfig.autoMode,
                                    userFeedback: checked
                                  }
                                });
                              }
                            }}
                          />
                          <Label>Feedback utilisateur</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Règles Automatiques</CardTitle>
                  <CardDescription>
                    Définissez les règles pour le changement automatique de thème
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedConfig.autoMode.rules?.map((rule, index) => (
                    <div key={rule.id} className="border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Conditions:</Label>
                        {rule.conditions.map((condition, condIndex) => (
                          <div key={condIndex} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                            <Badge variant="outline">{condition.type}</Badge>
                            <span>{condition.operator}</span>
                            <span className="font-mono text-xs">
                              {typeof condition.value === 'object'
                                ? `${condition.value.start} - ${condition.value.end}`
                                : condition.value
                              }
                            </span>
                            <Badge variant="secondary">Poids: {condition.weight}</Badge>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 mt-3">
                        <Label className="text-sm font-medium">Actions:</Label>
                        {rule.actions.map((action, actIndex) => (
                          <div key={actIndex} className="flex items-center gap-2 text-sm bg-muted p-2 rounded">
                            <Badge variant="outline">{action.type}</Badge>
                            <span>→</span>
                            <span className="font-mono text-xs">{action.target}</span>
                            {action.transition && <Badge variant="secondary">Transition</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {performanceMetrics && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métriques de Performance</CardTitle>
                  <CardDescription>
                    Performances du système de thèmes dynamiques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{performanceMetrics.themeSwitchTime}ms</div>
                      <div className="text-sm text-muted-foreground">Temps de changement</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{performanceMetrics.renderTime}ms</div>
                      <div className="text-sm text-muted-foreground">Temps de rendu</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{performanceMetrics.memoryUsage}MB</div>
                      <div className="text-sm text-muted-foreground">Mémoire utilisée</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{performanceMetrics.cpuUsage}%</div>
                      <div className="text-sm text-muted-foreground">Utilisation CPU</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{performanceMetrics.userSatisfaction}/5</div>
                      <div className="text-sm text-muted-foreground">Satisfaction utilisateur</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimisations</CardTitle>
                  <CardDescription>
                    Recommandations pour améliorer les performances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        Les temps de changement de thème sont optimaux. Continuez à surveiller les performances.
                      </AlertDescription>
                    </Alert>

                    <div className="text-sm space-y-1">
                      <div>• Utiliser le lazy loading pour les variations de thème</div>
                      <div>• Implémenter le cache des configurations de thème</div>
                      <div>• Optimiser les animations pour les appareils mobiles</div>
                      <div>• Surveiller l'utilisation mémoire sur les longues sessions</div>
                      <div>• Activer la compression des données de thème</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DynamicThemeSystem;
