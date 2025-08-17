import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { securityService } from '@/services/securityService';
import type { SecuritySetting } from '@/types/security';

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await securityService.getAll();
        setSettings(data);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les paramètres',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleEdit = (key: string, value: string) => {
    setEditing(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (setting: SecuritySetting) => {
    try {
      await securityService.update(setting.key, editing[setting.key]);
      setSettings(prev =>
        prev.map(s =>
          s.key === setting.key
            ? { ...s, value: editing[setting.key] }
            : s
        )
      );
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[setting.key];
        return newState;
      });
      toast({
        title: 'Succès',
        description: 'Paramètre mis à jour',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de sécurité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map(setting => (
            <div key={setting.key} className="grid grid-cols-3 gap-4 items-center">
              <Label htmlFor={setting.key}>{setting.description || setting.key}</Label>
              {editing[setting.key] !== undefined ? (
                <>
                  <Input
                    id={setting.key}
                    value={editing[setting.key]}
                    onChange={(e) => handleEdit(setting.key, e.target.value)}
                  />
                  <Button onClick={() => handleSave(setting)}>
                    Enregistrer
                  </Button>
                </>
              ) : (
                <>
                  <div>{setting.value}</div>
                  <Button variant="outline" onClick={() => handleEdit(setting.key, setting.value)}>
                    Modifier
                  </Button>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
