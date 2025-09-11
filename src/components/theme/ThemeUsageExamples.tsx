import React, { useState } from 'react';
import { Code, Copy, Check, Eye, Palette, Type, Layout, Border, Shadow } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { ThemeConfig } from './types';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { ThemeSelector } from './ThemeSelector';
import { ShadowCustomizationPanel } from './ShadowCustomizationPanel';
import { SpacingCustomizationPanel } from './SpacingCustomizationPanel';
import { BorderCustomizationPanel } from './BorderCustomizationPanel';
import { FontCustomizationPanel } from './FontCustomizationPanel';

/**
 * Interface pour les exemples de code
 */
interface CodeExample {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'advanced' | 'integration';
  code: string;
  language: 'tsx' | 'css' | 'json';
  dependencies?: string[];
}

/**
 * Composant pour afficher les exemples d'utilisation du système de thème
 */
export function ThemeUsageExamples() {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedExample, setSelectedExample] = useState<string>('basic-theme-provider');
  const [copied, setCopied] = useState<string | null>(null);

  // Exemples de code
  const codeExamples: CodeExample[] = [
    {
      id: 'basic-theme-provider',
      title: 'Utilisation de base du ThemeProvider',
      description: 'Comment envelopper votre application avec ThemeProvider',
      category: 'basic',
      language: 'tsx',
      code: `import { ThemeProvider } from './components/theme/ThemeProvider';
import { useTheme } from './components/theme/useTheme';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <YourAppContent />
    </ThemeProvider>
  );
}

function YourAppContent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={\`theme-\${theme}\`}>
      <h1>Mon Application</h1>
      <button onClick={() => setTheme('dark')}>
        Passer en mode sombre
      </button>
    </div>
  );
}`
    },
    {
      id: 'theme-selector',
      title: 'Intégration du ThemeSelector',
      description: 'Comment ajouter un sélecteur de thème à votre application',
      category: 'basic',
      language: 'tsx',
      code: `import { ThemeSelector } from './components/theme/ThemeSelector';

function SettingsPage() {
  const handleThemeChange = (newTheme) => {
    console.log('Nouveau thème:', newTheme);
  };

  return (
    <div className="space-y-6">
      <h2>Paramètres</h2>

      <ThemeSelector
        currentTheme="light"
        onThemeChange={handleThemeChange}
        label="Thème de l'application"
        description="Choisissez votre thème préféré"
      />
    </div>
  );
}`
    },
    {
      id: 'custom-colors',
      title: 'Personnalisation des couleurs',
      description: 'Comment utiliser le système de couleurs personnalisé',
      category: 'advanced',
      language: 'tsx',
      code: `import { ColorCustomizationPanel } from './components/theme/ColorCustomizationPanel';
import type { ThemeConfig } from './components/theme/types';

function DesignSystem() {
  const [config, setConfig] = useState<ThemeConfig>({
    id: 'my-app',
    name: 'My App',
    colors: {
      light: {
        primary: '#3b82f6',
        secondary: '#64748b',
        // ... autres couleurs
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        // ... autres couleurs
      }
    },
    // ... autres configurations
  });

  return (
    <ColorCustomizationPanel
      config={config}
      onConfigChange={setConfig}
      label="Personnalisation des couleurs"
      description="Configurez la palette de couleurs de votre application"
    />
  );
}`
    },
    {
      id: 'font-customization',
      title: 'Personnalisation des polices',
      description: 'Comment configurer les polices et le typographie',
      category: 'advanced',
      language: 'tsx',
      code: `import { FontCustomizationPanel } from './components/theme/FontCustomizationPanel';

function TypographySettings() {
  const [config, setConfig] = useState({
    // ... votre configuration
  });

  return (
    <FontCustomizationPanel
      config={config}
      onConfigChange={setConfig}
      label="Paramètres de typographie"
      description="Personnalisez les polices et les styles de texte"
    />
  );
}`
    },
    {
      id: 'spacing-system',
      title: 'Système d\'espacement',
      description: 'Comment utiliser et personnaliser l\'espacement',
      category: 'advanced',
      language: 'tsx',
      code: `import { SpacingCustomizationPanel } from './components/theme/SpacingCustomizationPanel';

function LayoutSettings() {
  const [config, setConfig] = useState({
    // ... votre configuration
  });

  return (
    <SpacingCustomizationPanel
      config={config}
      onConfigChange={setConfig}
      label="Système d'espacement"
      description="Configurez l'espacement et la mise en page"
    />
  );
}`
    },
    {
      id: 'border-system',
      title: 'Système de bordures',
      description: 'Comment personnaliser les bordures et les coins arrondis',
      category: 'advanced',
      language: 'tsx',
      code: `import { BorderCustomizationPanel } from './components/theme/BorderCustomizationPanel';

function BorderSettings() {
  const [config, setConfig] = useState({
    // ... votre configuration
  });

  return (
    <BorderCustomizationPanel
      config={config}
      onConfigChange={setConfig}
      label="Style des bordures"
      description="Personnalisez les bordures et les coins arrondis"
    />
  );
}`
    },
    {
      id: 'shadow-system',
      title: 'Système d\'ombres',
      description: 'Comment configurer les ombres et les effets visuels',
      category: 'advanced',
      language: 'tsx',
      code: `import { ShadowCustomizationPanel } from './components/theme/ShadowCustomizationPanel';

function ShadowSettings() {
  const [config, setConfig] = useState({
    // ... votre configuration
  });

  return (
    <ShadowCustomizationPanel
      config={config}
      onConfigChange={setConfig}
      label="Effets d'ombres"
      description="Configurez les ombres et les effets visuels"
    />
  );
}`
    },
    {
      id: 'full-integration',
      title: 'Intégration complète',
      description: 'Exemple complet d\'intégration du système de thème',
      category: 'integration',
      language: 'tsx',
      code: `import { ThemeProvider, useTheme } from './components/theme/ThemeProvider';
import { ThemeSelector } from './components/theme/ThemeSelector';
import { ColorCustomizationPanel } from './components/theme/ColorCustomizationPanel';
import { FontCustomizationPanel } from './components/theme/FontCustomizationPanel';
import { SpacingCustomizationPanel } from './components/theme/SpacingCustomizationPanel';
import { BorderCustomizationPanel } from './components/theme/BorderCustomizationPanel';
import { ShadowCustomizationPanel } from './components/theme/ShadowCustomizationPanel';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Dashboard />
    </ThemeProvider>
  );
}

function Dashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={\`min-h-screen bg-background text-foreground\`}>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Design System</h1>
            <ThemeSelector
              currentTheme={theme}
              onThemeChange={(newTheme) => console.log(newTheme)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="colors">Couleurs</TabsTrigger>
            <TabsTrigger value="fonts">Polices</TabsTrigger>
            <TabsTrigger value="spacing">Espacement</TabsTrigger>
            <TabsTrigger value="borders">Bordures</TabsTrigger>
            <TabsTrigger value="shadows">Ombres</TabsTrigger>
          </TabsList>

          <TabsContent value="colors">
            <ColorCustomizationPanel
              config={config}
              onConfigChange={setConfig}
            />
          </TabsContent>

          <TabsContent value="fonts">
            <FontCustomizationPanel
              config={config}
              onConfigChange={setConfig}
            />
          </TabsContent>

          {/* ... autres onglets */}
        </Tabs>
      </main>
    </div>
  );
}`
    },
    {
      id: 'css-variables',
      title: 'Variables CSS générées',
      description: 'Comment utiliser les variables CSS générées',
      category: 'integration',
      language: 'css',
      code: `/* Variables CSS générées par le système de thème */
:root {
  /* Couleurs */
  --color-primary: 59 130 246;
  --color-secondary: 100 116 139;
  --color-background: 255 255 255;
  --color-foreground: 15 23 42;

  /* Espacement */
  --spacing-px: 1px;
  --spacing-0: 0;
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;

  /* Bordures */
  --border-width: 1px;
  --border-radius: 0.5rem;

  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Mode sombre */
.dark {
  --color-background: 15 23 42;
  --color-foreground: 248 250 252;
  --color-primary: 96 165 250;
  --color-secondary: 148 163 184;
}

/* Utilisation dans les composants */
.my-component {
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
  padding: var(--spacing-4);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
}`
    },
    {
      id: 'theme-config',
      title: 'Configuration de thème',
      description: 'Structure d\'un objet de configuration de thème',
      category: 'integration',
      language: 'json',
      code: `{
  "id": "my-app",
  "name": "My Application",
  "version": "1.0.0",

  "colors": {
    "light": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "background": "#ffffff",
      "foreground": "#0f172a",
      "muted": "#f1f5f9",
      "accent": "#f8fafc",
      "destructive": "#ef4444",
      "success": "#22c55e",
      "warning": "#f59e0b",
      "info": "#3b82f6"
    },
    "dark": {
      "primary": "#60a5fa",
      "secondary": "#94a3b8",
      "background": "#0f172a",
      "foreground": "#f8fafc",
      "muted": "#1e293b",
      "accent": "#334155",
      "destructive": "#f87171",
      "success": "#4ade80",
      "warning": "#facc15",
      "info": "#60a5fa"
    }
  },

  "fonts": {
    "sans": ["Inter", "system-ui", "sans-serif"],
    "serif": ["Merriweather", "Georgia", "serif"],
    "mono": ["JetBrains Mono", "Fira Code", "monospace"],
    "sizes": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem",
      "8xl": "6rem"
    }
  },

  "spacing": {
    "unit": "rem",
    "scale": 1,
    "values": {
      "px": "1px",
      "0": "0",
      "0.5": "0.125rem",
      "1": "0.25rem",
      "1.5": "0.375rem",
      "2": "0.5rem",
      "2.5": "0.625rem",
      "3": "0.75rem",
      "3.5": "0.875rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "7": "1.75rem",
      "8": "2rem",
      "9": "2.25rem",
      "10": "2.5rem",
      "11": "2.75rem",
      "12": "3rem",
      "14": "3.5rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem",
      "28": "7rem",
      "32": "8rem",
      "36": "9rem",
      "40": "10rem",
      "44": "11rem",
      "48": "12rem",
      "52": "13rem",
      "56": "14rem",
      "60": "15rem",
      "64": "16rem",
      "72": "18rem",
      "80": "20rem",
      "96": "24rem"
    }
  },

  "borders": {
    "widths": {
      "0": "0",
      "1": "1px",
      "2": "2px",
      "4": "4px",
      "8": "8px"
    },
    "radius": {
      "none": "0",
      "sm": "0.125rem",
      "DEFAULT": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      "full": "9999px"
    }
  },

  "shadows": {
    "none": "none",
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "DEFAULT": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.06)"
  }
}`
    }
  ];

  // Filtrer les exemples par catégorie
  const filteredExamples = codeExamples.filter(example => example.category === activeTab);

  // Copier le code
  const copyCode = async (code: string, exampleId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(exampleId);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Obtenir l'exemple sélectionné
  const selectedExampleData = codeExamples.find(example => example.id === selectedExample);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code size={24} />
          Exemples d'Utilisation
        </h2>
        <p className="text-muted-foreground">
          Découvrez comment intégrer et utiliser le système de thème dans vos applications
        </p>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basique</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
          <TabsTrigger value="integration">Intégration</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Liste des exemples */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExamples.map((example) => (
              <Card
                key={example.id}
                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-md ${
                  selectedExample === example.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedExample(example.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{example.language}</Badge>
                    {example.category === 'basic' && <Palette size={16} className="text-blue-500" />}
                    {example.category === 'advanced' && <Type size={16} className="text-green-500" />}
                    {example.category === 'integration' && <Layout size={16} className="text-purple-500" />}
                  </div>

                  <h3 className="font-semibold mb-2">{example.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {example.description}
                  </p>

                  {example.dependencies && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Dépendances:</div>
                      {example.dependencies.map((dep, index) => (
                        <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                          {dep}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Détails de l'exemple sélectionné */}
          {selectedExampleData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {selectedExampleData.title}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCode(selectedExampleData.code, selectedExampleData.id)}
                  >
                    {copied === selectedExampleData.id ? (
                      <>
                        <Check size={16} className="mr-2" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copier
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedExampleData.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={selectedExampleData.code}
                  readOnly
                  className={`font-mono text-xs min-h-[400px] ${
                    selectedExampleData.language === 'tsx' ? 'language-tsx' :
                    selectedExampleData.language === 'css' ? 'language-css' :
                    'language-json'
                  }`}
                />
              </CardContent>
            </Card>
          )}

          {/* Aperçu en direct */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Aperçu en Direct
              </CardTitle>
              <CardDescription>
                Testez les composants du système de thème
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeProvider>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Sélecteur de thème</Label>
                    <ThemeSelector />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Personnalisation des ombres</Label>
                      <ShadowCustomizationPanel
                        config={{
                          id: 'preview',
                          name: 'Preview',
                          colors: {
                            light: {
                              primary: '#3b82f6',
                              secondary: '#64748b',
                              background: '#ffffff',
                              foreground: '#0f172a',
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
                              foreground: '#f8fafc',
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
                            serif: ['Merriweather', 'Georgia', 'serif'],
                            mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
                            '3xl': '0 35px 60px -15px rgb(0 0 0 / 0.3)',
                            inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
                            coloredPrimary: '0 4px 6px -1px hsl(var(--primary) / 0.3)',
                            coloredSecondary: '0 4px 6px -1px hsl(var(--secondary) / 0.3)',
                            coloredSuccess: '0 4px 6px -1px hsl(var(--success) / 0.3)',
                            coloredWarning: '0 4px 6px -1px hsl(var(--warning) / 0.3)',
                            coloredError: '0 4px 6px -1px hsl(var(--error) / 0.3)',
                            coloredInfo: '0 4px 6px -1px hsl(var(--info) / 0.3)'
                          }
                        }}
                        onConfigChange={() => {}}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Personnalisation des bordures</Label>
                      <BorderCustomizationPanel
                        config={{
                          id: 'preview',
                          name: 'Preview',
                          colors: {
                            light: {
                              primary: '#3b82f6',
                              secondary: '#64748b',
                              background: '#ffffff',
                              foreground: '#0f172a',
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
                              foreground: '#f8fafc',
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
                            serif: ['Merriweather', 'Georgia', 'serif'],
                            mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
                            '3xl': '0 35px 60px -15px rgb(0 0 0 / 0.3)',
                            inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
                            coloredPrimary: '0 4px 6px -1px hsl(var(--primary) / 0.3)',
                            coloredSecondary: '0 4px 6px -1px hsl(var(--secondary) / 0.3)',
                            coloredSuccess: '0 4px 6px -1px hsl(var(--success) / 0.3)',
                            coloredWarning: '0 4px 6px -1px hsl(var(--warning) / 0.3)',
                            coloredError: '0 4px 6px -1px hsl(var(--error) / 0.3)',
                            coloredInfo: '0 4px 6px -1px hsl(var(--info) / 0.3)'
                          }
                        }}
                        onConfigChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </ThemeProvider>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ThemeUsageExamples;
