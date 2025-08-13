import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Shield, Lock, UserCheck, FileText, Calendar, Trash2, Plus, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface ComplianceConfig {
  id?: string;
  gdprEnabled: boolean;
  dataRetentionPeriod: number;
  anonymizeAfterRetention: boolean;
  requireConsent: boolean;
  consentText: string;
  privacyPolicyUrl: string;
  logSensitiveDataAccess: boolean;
  encryptSensitiveData: boolean;
  dataBreachNotification: boolean;
  dataBreachEmails?: string[];
  hipaaCompliance: boolean;
  pciDssCompliance: boolean;
  soxCompliance: boolean;
  advancedSettings?: any;
}

interface ConsentRecord {
  id: string;
  userId: string;
  user: string;
  consentType: string;
  consentDate: string;
  consentValue: boolean;
  policyVersion: string;
  ipAddress: string;
  collectionMethod: string;
  expiryDate: string;
}

const ComplianceSettings: React.FC = () => {
  const { toast } = useToast();
  const [complianceConfig, setComplianceConfig] = useState<ComplianceConfig>({
    gdprEnabled: true,
    dataRetentionPeriod: 730,
    anonymizeAfterRetention: true,
    requireConsent: true,
    consentText: '',
    privacyPolicyUrl: '',
    logSensitiveDataAccess: true,
    encryptSensitiveData: true,
    dataBreachNotification: true,
    hipaaCompliance: false,
    pciDssCompliance: false,
    soxCompliance: false
  });
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConsent, setLoadingConsent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger la configuration de conformité
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/complianceconfig');
        setComplianceConfig(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration de conformité:', err);
        setError('Impossible de charger la configuration de conformité. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Charger les enregistrements de consentement
  useEffect(() => {
    const fetchConsentRecords = async () => {
      setLoadingConsent(true);

      try {
        const response = await api.get('/consentrecords');
        setConsentRecords(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des enregistrements de consentement:', err);
      } finally {
        setLoadingConsent(false);
      }
    };

    fetchConsentRecords();
  }, []);

  // Sauvegarder la configuration
  const saveConfig = async () => {
    setSaving(true);

    try {
      const response = await api.put('/complianceconfig', complianceConfig);
      setComplianceConfig(response.data);

      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres de conformité ont été mis à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la configuration de conformité:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres de conformité.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredConsentRecords = consentRecords.filter(record =>
    record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.consentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conformité</h1>
          <p className="text-muted-foreground mt-1">Gestion de la conformité réglementaire</p>
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

      <div className="space-y-6">
        {/* Configuration de conformité */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuration de conformité</CardTitle>
              <CardDescription>Paramètres de conformité réglementaire</CardDescription>
            </div>
            <Button
              onClick={saveConfig}
              disabled={saving || loading}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* RGPD */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">RGPD</h3>
                      <Badge variant={complianceConfig.gdprEnabled ? 'default' : 'secondary'}>
                        {complianceConfig.gdprEnabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <Switch
                      checked={complianceConfig.gdprEnabled}
                      onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, gdprEnabled: checked})}
                    />
                  </div>

                  {complianceConfig.gdprEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="retention-period">Période de conservation (jours)</Label>
                          <Input
                            id="retention-period"
                            type="number"
                            value={complianceConfig.dataRetentionPeriod}
                            onChange={(e) => setComplianceConfig({...complianceConfig, dataRetentionPeriod: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="privacy-policy-url">URL de la politique de confidentialité</Label>
                          <Input
                            id="privacy-policy-url"
                            value={complianceConfig.privacyPolicyUrl}
                            onChange={(e) => setComplianceConfig({...complianceConfig, privacyPolicyUrl: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="anonymize"
                            checked={complianceConfig.anonymizeAfterRetention}
                            onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, anonymizeAfterRetention: checked})}
                          />
                          <Label htmlFor="anonymize">Anonymiser après la période de conservation</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="require-consent"
                            checked={complianceConfig.requireConsent}
                            onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, requireConsent: checked})}
                          />
                          <Label htmlFor="require-consent">Exiger le consentement explicite</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="log-sensitive"
                            checked={complianceConfig.logSensitiveDataAccess}
                            onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, logSensitiveDataAccess: checked})}
                          />
                          <Label htmlFor="log-sensitive">Journaliser l'accès aux données sensibles</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="encrypt-sensitive"
                            checked={complianceConfig.encryptSensitiveData}
                            onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, encryptSensitiveData: checked})}
                          />
                          <Label htmlFor="encrypt-sensitive">Chiffrer les données sensibles</Label>
                        </div>
                      </div>

                      {complianceConfig.requireConsent && (
                        <div>
                          <Label htmlFor="consent-text">Texte de consentement</Label>
                          <Input
                            id="consent-text"
                            value={complianceConfig.consentText}
                            onChange={(e) => setComplianceConfig({...complianceConfig, consentText: e.target.value})}
                            className="h-24"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notification de violation de données */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Notification de violation de données</h3>
                      <Badge variant={complianceConfig.dataBreachNotification ? 'default' : 'secondary'}>
                        {complianceConfig.dataBreachNotification ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <Switch
                      checked={complianceConfig.dataBreachNotification}
                      onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, dataBreachNotification: checked})}
                    />
                  </div>

                  {complianceConfig.dataBreachNotification && (
                    <div>
                      <Label htmlFor="breach-emails">Emails de notification (séparés par des virgules)</Label>
                      <Input
                        id="breach-emails"
                        value={complianceConfig.dataBreachEmails ? (Array.isArray(complianceConfig.dataBreachEmails) ? complianceConfig.dataBreachEmails.join(', ') : complianceConfig.dataBreachEmails) : ''}
                        onChange={(e) => setComplianceConfig({...complianceConfig, dataBreachEmails: e.target.value.split(',').map(email => email.trim())})}
                        placeholder="admin@example.com, security@example.com"
                      />
                    </div>
                  )}
                </div>

                {/* Autres normes de conformité */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Autres normes de conformité</h3>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hipaa"
                        checked={complianceConfig.hipaaCompliance}
                        onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, hipaaCompliance: checked})}
                      />
                      <Label htmlFor="hipaa">HIPAA (Santé)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pci-dss"
                        checked={complianceConfig.pciDssCompliance}
                        onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, pciDssCompliance: checked})}
                      />
                      <Label htmlFor="pci-dss">PCI-DSS (Paiement)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sox"
                        checked={complianceConfig.soxCompliance}
                        onCheckedChange={(checked) => setComplianceConfig({...complianceConfig, soxCompliance: checked})}
                      />
                      <Label htmlFor="sox">SOX (Finance)</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enregistrements de consentement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Enregistrements de consentement</CardTitle>
              <CardDescription>Historique des consentements utilisateurs</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline">
                <UserCheck className="h-4 w-4 mr-2" />
                Demander un consentement
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input
                placeholder="Rechercher un utilisateur ou un type de consentement..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loadingConsent ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement des enregistrements de consentement...</span>
              </div>
            ) : consentRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">Aucun enregistrement de consentement disponible</div>
                <div className="text-sm">Les consentements utilisateurs seront enregistrés ici</div>
              </div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Expiration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsentRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.user}</TableCell>
                        <TableCell>{record.consentType}</TableCell>
                        <TableCell>{formatDate(record.consentDate)}</TableCell>
                        <TableCell>
                          {record.consentValue ? (
                            <Badge variant="default" className="flex items-center">
                              <Check className="h-3 w-3 mr-1" />
                              Accepté
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center">
                              <X className="h-3 w-3 mr-1" />
                              Refusé
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{record.policyVersion}</TableCell>
                        <TableCell>{record.collectionMethod}</TableCell>
                        <TableCell>{formatDate(record.expiryDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outils de conformité */}
        <Card>
          <CardHeader>
            <CardTitle>Outils de conformité</CardTitle>
            <CardDescription>Fonctionnalités pour gérer la conformité</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-full py-6">
              <UserCheck className="h-6 w-6" />
              <span>Gestion des consentements</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-full py-6">
              <FileText className="h-6 w-6" />
              <span>Demandes d'accès</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-full py-6">
              <Trash2 className="h-6 w-6" />
              <span>Demandes de suppression</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceSettings;