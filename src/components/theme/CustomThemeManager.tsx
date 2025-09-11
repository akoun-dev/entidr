import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Plus, Trash2, Copy, Edit, Eye, Palette, Settings, Users, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Switch } from '../ui/switch';
import type { ThemeConfig } from './types';

/**
 * Interface pour un thème personnalisé
 */
interface CustomTheme {
  id: string;
  name: string;
  description: string;
  config: ThemeConfig;
  isPublic: boolean;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: 'business' | 'creative' | 'technical' | 'minimal' | 'colorful';
}

/**
 * Interface pour les utilisateurs et leurs préférences
 */
interface UserThemePreferences {
  userId: string;
  username: string;
  defaultTheme: string;
  customThemes: string[];
  themeHistory: {
    themeId: string;
    appliedAt: Date;
  }[];
  permissions: {
    canCreateThemes: boolean;
    canShareThemes: boolean;
    canEditPublicThemes: boolean;
  };
}

/**
 * Interface pour l'API de gestion des thèmes
 */
interface ThemeAPI {
  // Opérations CRUD
  createTheme: (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CustomTheme>;
  getTheme: (id: string) => Promise<CustomTheme>;
  updateTheme: (id: string, updates: Partial<CustomTheme>) => Promise<CustomTheme>;
  deleteTheme: (id: string) => Promise<void>;

  // Recherche et filtrage
  searchThemes: (query: string, filters?: ThemeFilters) => Promise<CustomTheme[]>;
  getThemesByUser: (userId: string) => Promise<CustomTheme[]>;
  getPublicThemes: () => Promise<CustomTheme[]>;
  getThemesByCategory: (category: string) => Promise<CustomTheme[]>;

  // Export/Import
  exportTheme: (id: string) => Promise<string>;
  importTheme: (themeData: string) => Promise<CustomTheme>;

  // Utilisateurs
  getUserPreferences: (userId: string) => Promise<UserThemePreferences>;
  updateUserPreferences: (userId: string, preferences: Partial<UserThemePreferences>) => Promise<void>;
  applyThemeToUser: (userId: string, themeId: string) => Promise<void>;
}

/**
 * Interface pour les filtres de recherche
 */
interface ThemeFilters {
  category?: string;
  tags?: string[];
  author?: string;
  isPublic?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Composant pour gérer les thèmes personnalisés
 */
export function CustomThemeManager() {
  const [activeTab, setActiveTab] = useState('themes');
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [users, setUsers] = useState<UserThemePreferences[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<CustomTheme | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAPI, setShowAPI] = useState(false);

  // Simuler des données initiales
  useEffect(() => {
    const mockThemes: CustomTheme[] = [
      {
        id: '1',
        name: 'Corporate Blue',
        description: 'Thème professionnel pour entreprises',
        config: {
          id: 'corporate-blue',
          name: 'Corporate Blue',
          colors: {
            light: {
              primary: '#2563eb',
              secondary: '#64748b',
              background: '#ffffff',
              foreground: '#0f172a'
            },
            dark: {
              primary: '#3b82f6',
              secondary: '#94a3b8',
              background: '#0f172a',
              foreground: '#f8fafc'
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
            '1': '0.25rem',
            '2': '0.5rem',
            '3': '0.75rem',
            '4': '1rem',
            '5': '1.25rem',
            '6': '1.5rem',
            '7': '1.75rem',
            '8': '2rem'
          },
          borders: {
            widthNone: '0',
            widthSm: '1px',
            widthMd: '2px',
            widthLg: '4px',
            styleNone: 'none',
            styleSolid: 'solid',
            radiusNone: '0',
            radiusSm: '0.125rem',
            radiusMd: '0.25rem',
            radiusLg: '0.5rem'
          },
          shadows: {
            none: 'none',
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }
        },
        isPublic: true,
        author: 'admin',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        tags: ['business', 'professional', 'blue'],
        category: 'business'
      },
      {
        id: '2',
        name: 'Creative Purple',
        description: 'Thème créatif et vibrant',
        config: {
          id: 'creative-purple',
          name: 'Creative Purple',
          colors: {
            light: {
              primary: '#9333ea',
              secondary: '#a855f7',
              background: '#fefefe',
              foreground: '#1a1a1a'
            },
            dark: {
              primary: '#a855f7',
              secondary: '#c084fc',
              background: '#1a1a1a',
              foreground: '#fefefe'
            }
          },
          fonts: {
            sans: ['Poppins', 'system-ui', 'sans-serif'],
            serif: ['Playfair Display', 'serif'],
            mono: ['Fira Code', 'monospace'],
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
            '1': '0.25rem',
            '2': '0.5rem',
            '3': '0.75rem',
            '4': '1rem',
            '5': '1.25rem',
            '6': '1.5rem',
            '7': '1.75rem',
            '8': '2rem'
          },
          borders: {
            widthNone: '0',
            widthSm: '1px',
            widthMd: '2px',
            widthLg: '4px',
            styleNone: 'none',
            styleSolid: 'solid',
            radiusNone: '0',
            radiusSm: '0.125rem',
            radiusMd: '0.25rem',
            radiusLg: '0.5rem'
          },
          shadows: {
            none: 'none',
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }
        },
        isPublic: false,
        author: 'designer1',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-05'),
        tags: ['creative', 'purple', 'vibrant'],
        category: 'creative'
      }
    ];

    const mockUsers: UserThemePreferences[] = [
      {
        userId: 'user1',
        username: 'John Doe',
        defaultTheme: '1',
        customThemes: ['1'],
        themeHistory: [
          { themeId: '1', appliedAt: new Date('2024-01-20') }
        ],
        permissions: {
          canCreateThemes: true,
          canShareThemes: true,
          canEditPublicThemes: false
        }
      },
      {
        userId: 'user2',
        username: 'Jane Smith',
        defaultTheme: '2',
        customThemes: ['2'],
        themeHistory: [
          { themeId: '2', appliedAt: new Date('2024-02-05') }
        ],
        permissions: {
          canCreateThemes: true,
          canShareThemes: false,
          canEditPublicThemes: false
        }
      }
    ];

    setThemes(mockThemes);
    setUsers(mockUsers);
  }, []);

  // Filtrer les thèmes
  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Créer un nouveau thème
  const createTheme = async (themeData: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTheme: CustomTheme = {
      ...themeData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setThemes(prev => [...prev, newTheme]);
    setIsCreating(false);
  };

  // Mettre à jour un thème
  const updateTheme = async (id: string, updates: Partial<CustomTheme>) => {
    setThemes(prev => prev.map(theme =>
      theme.id === id
        ? { ...theme, ...updates, updatedAt: new Date() }
        : theme
    ));
    setIsEditing(false);
    setSelectedTheme(null);
  };

  // Supprimer un thème
  const deleteTheme = async (id: string) => {
    setThemes(prev => prev.filter(theme => theme.id !== id));
    setSelectedTheme(null);
  };

  // Exporter un thème
  const exportTheme = async (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) return;

    const exportData = JSON.stringify(theme, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.replace(/\s+/g, '-')}-theme.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importer un thème
  const importTheme = async (file: File) => {
    const text = await file.text();
    const themeData = JSON.parse(text);

    // Générer un nouvel ID et dates
    const importedTheme: CustomTheme = {
      ...themeData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setThemes(prev => [...prev, importedTheme]);
  };

  // Appliquer un thème à un utilisateur
  const applyThemeToUser = async (userId: string, themeId: string) => {
    setUsers(prev => prev.map(user =>
      user.userId === userId
        ? {
            ...user,
            defaultTheme: themeId,
            themeHistory: [
              ...user.themeHistory,
              { themeId, appliedAt: new Date() }
            ]
          }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette size={24} />
            Gestion des Thèmes Personnalisés
          </h2>
          <p className="text-muted-foreground">
            Créez, gérez et partagez des thèmes personnalisés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Nouveau Thème
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau thème</DialogTitle>
                <DialogDescription>
                  Configurez votre thème personnalisé
                </DialogDescription>
              </DialogHeader>
              <ThemeForm onSubmit={createTheme} onCancel={() => setIsCreating(false)} />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => setShowAPI(!showAPI)}>
            <Settings size={16} className="mr-2" />
            API
          </Button>
        </div>
      </div>

      {/* Documentation API */}
      {showAPI && (
        <Card>
          <CardHeader>
            <CardTitle>API de Gestion des Thèmes</CardTitle>
            <CardDescription>
              Documentation de l'API REST pour la gestion des thèmes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Endpoints</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-muted px-2 py-1 rounded">GET /api/themes</code> - Lister tous les thèmes</div>
                  <div><code className="bg-muted px-2 py-1 rounded">POST /api/themes</code> - Créer un nouveau thème</div>
                  <div><code className="bg-muted px-2 py-1 rounded">GET /api/themes/:id</code> - Obtenir un thème spécifique</div>
                  <div><code className="bg-muted px-2 py-1 rounded">PUT /api/themes/:id</code> - Mettre à jour un thème</div>
                  <div><code className="bg-muted px-2 py-1 rounded">DELETE /api/themes/:id</code> - Supprimer un thème</div>
                  <div><code className="bg-muted px-2 py-1 rounded">POST /api/themes/:id/export</code> - Exporter un thème</div>
                  <div><code className="bg-muted px-2 py-1 rounded">POST /api/themes/import</code> - Importer un thème</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Gestion des utilisateurs</h4>
                <div className="space-y-2 text-sm">
                  <div><code className="bg-muted px-2 py-1 rounded">GET /api/users/:userId/themes</code> - Thèmes d'un utilisateur</div>
                  <div><code className="bg-muted px-2 py-1 rounded">POST /api/users/:userId/themes/:themeId</code> - Appliquer un thème</div>
                  <div><code className="bg-muted px-2 py-1 rounded">GET /api/users/:userId/preferences</code> - Préférences utilisateur</div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  L'API supporte l'authentification JWT, le pagination, le filtrage et le tri des résultats.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="themes">Thèmes</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          {/* Filtres et recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher des thèmes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="creative">Créatif</SelectItem>
                    <SelectItem value="technical">Technique</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="colorful">Coloré</SelectItem>
                  </SelectContent>
                </Select>

                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importTheme(file);
                  }}
                  className="hidden"
                  id="import-theme"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-theme')?.click()}>
                  <Upload size={16} className="mr-2" />
                  Importer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liste des thèmes */}
          <div className="grid gap-4">
            {filteredThemes.map((theme) => (
              <Card key={theme.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded-lg border"
                          style={{ backgroundColor: theme.config.colors.light.primary }}
                        />
                        <div>
                          <h3 className="font-semibold">{theme.name}</h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{theme.category}</Badge>
                            {theme.isPublic && <Badge variant="secondary">Public</Badge>}
                            <span className="text-xs text-muted-foreground">
                              par {theme.author}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportTheme(theme.id)}
                      >
                        <Download size={16} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTheme(theme);
                          setIsEditing(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTheme(theme.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    {theme.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.userId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Users size={24} className="text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">{user.username}</h3>
                          <p className="text-sm text-muted-foreground">
                            Thème par défaut: {themes.find(t => t.id === user.defaultTheme)?.name || 'Non défini'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {user.customThemes.length} thèmes personnalisés
                            </Badge>
                            <Badge variant="outline">
                              {user.themeHistory.length} applications
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={user.defaultTheme}
                        onValueChange={(value) => applyThemeToUser(user.userId, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Choisir un thème" />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Permissions</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Switch checked={user.permissions.canCreateThemes} disabled />
                        <span>Créer des thèmes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={user.permissions.canShareThemes} disabled />
                        <span>Partager des thèmes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={user.permissions.canEditPublicThemes} disabled />
                        <span>Éditer les thèmes publics</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prévisualisation en Temps Réel</CardTitle>
              <CardDescription>
                Testez vos thèmes avec un aperçu instantané
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {themes.slice(0, 2).map((theme) => (
                  <div key={theme.id} className="space-y-4">
                    <h4 className="font-semibold">{theme.name}</h4>
                    <div
                      className="p-6 rounded-lg border transition-all duration-300"
                      style={{
                        backgroundColor: theme.config.colors.light.background,
                        color: theme.config.colors.light.foreground,
                        fontFamily: theme.config.fonts.sans?.[0]
                      }}
                    >
                      <h5 style={{ color: theme.config.colors.light.primary }}>
                        Titre Principal
                      </h5>
                      <p style={{ color: theme.config.colors.light.secondary }}>
                        Ceci est un exemple de texte pour tester le thème.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          className="px-4 py-2 rounded text-white"
                          style={{ backgroundColor: theme.config.colors.light.primary }}
                        >
                          Bouton Primaire
                        </button>
                        <button
                          className="px-4 py-2 rounded border"
                          style={{
                            borderColor: theme.config.colors.light.primary,
                            color: theme.config.colors.light.primary
                          }}
                        >
                          Bouton Secondaire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Animations de Transition de Thème</CardTitle>
              <CardDescription>
                Configurez les animations lors des changements de thème
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Type d'animation</Label>
                    <Select defaultValue="fade">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Fondu</SelectItem>
                        <SelectItem value="slide">Glissement</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="flip">Retournement</SelectItem>
                        <SelectItem value="rotate">Rotation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Durée (ms)</Label>
                    <Select defaultValue="300">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100ms - Rapide</SelectItem>
                        <SelectItem value="300">300ms - Normal</SelectItem>
                        <SelectItem value="500">500ms - Lent</SelectItem>
                        <SelectItem value="1000">1000ms - Très lent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Fonction de temporisation</Label>
                  <Select defaultValue="ease-in-out">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linéaire</SelectItem>
                      <SelectItem value="ease">Ease</SelectItem>
                      <SelectItem value="ease-in">Ease In</SelectItem>
                      <SelectItem value="ease-out">Ease Out</SelectItem>
                      <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch id="animations-enabled" defaultChecked />
                  <Label htmlFor="animations-enabled">Activer les animations de transition</Label>
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Les animations de thème améliorent l'expérience utilisateur en rendant les transitions plus fluides et agréables.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogue d'édition */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le thème</DialogTitle>
            <DialogDescription>
              Mettez à jour les paramètres de votre thème
            </DialogDescription>
          </DialogHeader>
          {selectedTheme && (
            <ThemeForm
              initialData={selectedTheme}
              onSubmit={(data) => updateTheme(selectedTheme.id, data)}
              onCancel={() => {
                setIsEditing(false);
                setSelectedTheme(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Formulaire de création/édition de thème
 */
interface ThemeFormProps {
  initialData?: CustomTheme;
  onSubmit: (data: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function ThemeForm({ initialData, onSubmit, onCancel }: ThemeFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    isPublic: initialData?.isPublic || false,
    author: initialData?.author || 'current-user',
    tags: initialData?.tags?.join(', ') || '',
    category: initialData?.category || 'business' as const,
    config: initialData?.config || {
      id: '',
      name: '',
      colors: {
        light: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          foreground: '#0f172a'
        },
        dark: {
          primary: '#60a5fa',
          secondary: '#94a3b8',
          background: '#0f172a',
          foreground: '#f8fafc'
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
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem'
      },
      borders: {
        widthNone: '0',
        widthSm: '1px',
        widthMd: '2px',
        widthLg: '4px',
        styleNone: 'none',
        styleSolid: 'solid',
        radiusNone: '0',
        radiusSm: '0.125rem',
        radiusMd: '0.25rem',
        radiusLg: '0.5rem'
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      config: {
        ...formData.config,
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
        name: formData.name
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom du thème</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select
          value={formData.category}
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="creative">Créatif</SelectItem>
            <SelectItem value="technical">Technique</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="colorful">Coloré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="ex: business, professional, blue"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is-public"
          checked={formData.isPublic}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
        />
        <Label htmlFor="is-public">Rendre ce thème public</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

export default CustomThemeManager;
