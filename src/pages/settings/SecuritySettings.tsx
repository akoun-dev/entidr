import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Lock, Shield, Key, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

// Interface pour les paramètres de sécurité
interface SecuritySetting {
  id: string;
  key: string;
  value: any;
  description: string;
  valueType: 'string' | 'boolean' | 'number' | 'json';
  category: string;
}

const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);

  // État pour les valeurs des paramètres
  const [securityConfig, setSecurityConfig] = useState({
    password_complexity: true,
    two_factor_auth: false,
    failed_login_attempts: 5,
    account_lockout_duration: 30,
    session_timeout: 60,
    password_min_length: 8,
    password_expiration_days: 90,
    password_history_count: 5,
    session_max_duration: 480,
    ip_restriction_enabled: false,
    force_ssl: true
  });

  // Charger les paramètres de sécurité depuis l'API
  useEffect(() => {
    const fetchSecuritySettings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/securitysettings');
        setSecuritySettings(response.data);

        // Mettre à jour l'état avec les valeurs de l'API
        const configFromApi: Record<string, any> = {};
        response.data.forEach((setting: SecuritySetting) => {
          configFromApi[setting.key] = setting.value;
        });

        setSecurityConfig(prev => ({
          ...prev,
          ...configFromApi
        }));
      } catch (err) {
        console.error('Erreur lors du chargement des paramètres de sécurité:', err);
        setError('Impossible de charger les paramètres de sécurité. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecuritySettings();
  }, []);

  // Gérer les changements de valeurs pour les switches (booléens)
  const handleToggle = (key: string) => {
    setSecurityConfig(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof securityConfig]
    }));
  };

  // Gérer les changements de valeurs pour les inputs numériques
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityConfig(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  // Sauvegarder les paramètres de sécurité
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      // Préparer les données à envoyer
      const settingsToUpdate = Object.entries(securityConfig).map(([key, value]) => ({
        key,
        value
      }));

      // Envoyer les données à l'API
      await api.put('/securitysettings/batch', { settings: settingsToUpdate });

      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de sécurité ont été mis à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des paramètres de sécurité:', err);
      setError('Impossible de sauvegarder les paramètres. Veuillez réessayer plus tard.');

      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sécurité</h1>
          <p className="text-muted-foreground mt-1">Configurez les paramètres de sécurité de l'application</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Carte principale */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de sécurité</CardTitle>
          <CardDescription>Configurez les options de sécurité pour protéger votre application</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des paramètres de sécurité...</span>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {/* Section Mots de passe */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Politique de mot de passe</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="password_complexity">
                          Complexité des mots de passe
                          <p className="text-xs text-muted-foreground mt-1">
                            Exiger des mots de passe complexes (majuscules, minuscules, chiffres, caractères spéciaux)
                          </p>
                        </Label>
                      </div>
                      <Switch
                        id="password_complexity"
                        checked={securityConfig.password_complexity}
                        onCheckedChange={() => handleToggle('password_complexity')}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password_min_length" className="text-right">
                        Longueur minimale
                      </Label>
                      <Input
                        id="password_min_length"
                        name="password_min_length"
                        type="number"
                        min="6"
                        max="32"
                        value={securityConfig.password_min_length}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password_expiration_days" className="text-right">
                        Expiration (jours)
                      </Label>
                      <Input
                        id="password_expiration_days"
                        name="password_expiration_days"
                        type="number"
                        min="0"
                        max="365"
                        value={securityConfig.password_expiration_days}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password_history_count" className="text-right">
                        Historique
                      </Label>
                      <Input
                        id="password_history_count"
                        name="password_history_count"
                        type="number"
                        min="0"
                        max="20"
                        value={securityConfig.password_history_count}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Authentification */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Authentification</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="two_factor_auth">
                          Authentification à deux facteurs
                          <p className="text-xs text-muted-foreground mt-1">
                            Exiger une vérification supplémentaire lors de la connexion
                          </p>
                        </Label>
                      </div>
                      <Switch
                        id="two_factor_auth"
                        checked={securityConfig.two_factor_auth}
                        onCheckedChange={() => handleToggle('two_factor_auth')}
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="failed_login_attempts" className="text-right">
                        Tentatives échouées avant blocage
                      </Label>
                      <Input
                        id="failed_login_attempts"
                        name="failed_login_attempts"
                        type="number"
                        min="1"
                        max="10"
                        value={securityConfig.failed_login_attempts}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="account_lockout_duration" className="text-right">
                        Durée de blocage (minutes)
                      </Label>
                      <Input
                        id="account_lockout_duration"
                        name="account_lockout_duration"
                        type="number"
                        min="1"
                        max="1440"
                        value={securityConfig.account_lockout_duration}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Session */}
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Gestion des sessions</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="session_timeout" className="text-right">
                        Délai d'inactivité (minutes)
                      </Label>
                      <Input
                        id="session_timeout"
                        name="session_timeout"
                        type="number"
                        min="1"
                        max="1440"
                        value={securityConfig.session_timeout}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="session_max_duration" className="text-right">
                        Durée maximale de session (minutes)
                      </Label>
                      <Input
                        id="session_max_duration"
                        name="session_max_duration"
                        type="number"
                        min="1"
                        max="1440"
                        value={securityConfig.session_max_duration}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Accès */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Contrôle d'accès</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="ip_restriction_enabled">
                          Restriction par adresse IP
                          <p className="text-xs text-muted-foreground mt-1">
                            Limiter l'accès à certaines adresses IP
                          </p>
                        </Label>
                      </div>
                      <Switch
                        id="ip_restriction_enabled"
                        checked={securityConfig.ip_restriction_enabled}
                        onCheckedChange={() => handleToggle('ip_restriction_enabled')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="force_ssl">
                          Forcer HTTPS
                          <p className="text-xs text-muted-foreground mt-1">
                            Exiger une connexion sécurisée pour accéder à l'application
                          </p>
                        </Label>
                      </div>
                      <Switch
                        id="force_ssl"
                        checked={securityConfig.force_ssl}
                        onCheckedChange={() => handleToggle('force_ssl')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  className="bg-ivory-orange hover:bg-ivory-orange/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
