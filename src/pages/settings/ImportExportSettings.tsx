import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { FileText, FileInput, FileOutput, Calendar, Download, Upload, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface ImportExportJob {
  id: string;
  operationType: 'import' | 'export';
  timestamp: string;
  user: string;
  dataType: string;
  fileFormat: string;
  fileName: string;
  fileSize: string;
  recordCount: number;
  status: 'success' | 'partial' | 'failed';
  errorDetails?: string;
  duration?: number;
  filePath?: string;
  expiresAt?: string;
}

interface ImportConfig {
  id?: string;
  allowedFormats: string[];
  maxFileSize: number;
  defaultDelimiter: string;
  defaultEncoding: string;
  validateBeforeImport: boolean;
  ignoreErrors: boolean;
  maxRows?: number;
  tempDirectory?: string;
  emailNotifications: boolean;
  notificationEmails?: string[];
  advancedSettings?: any;
}

interface ExportConfig {
  id?: string;
  availableFormats: string[];
  defaultFormat: string;
  defaultDelimiter: string;
  defaultEncoding: string;
  includeHeaders: boolean;
  maxRows?: number;
  tempDirectory?: string;
  compressExports: boolean;
  dateFormat: string;
  emailNotifications: boolean;
  notificationEmails?: string[];
  advancedSettings?: any;
}

const ImportExportSettings: React.FC = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ImportExportJob[]>([]);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    allowedFormats: ['csv', 'xlsx', 'xml', 'json'],
    maxFileSize: 10485760,
    defaultDelimiter: ',',
    defaultEncoding: 'UTF-8',
    validateBeforeImport: true,
    ignoreErrors: false,
    emailNotifications: true
  });
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    availableFormats: ['csv', 'xlsx', 'xml', 'json', 'pdf'],
    defaultFormat: 'xlsx',
    defaultDelimiter: ',',
    defaultEncoding: 'UTF-8',
    includeHeaders: true,
    compressExports: true,
    dateFormat: 'YYYY-MM-DD',
    emailNotifications: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingImportConfig, setLoadingImportConfig] = useState(true);
  const [loadingExportConfig, setLoadingExportConfig] = useState(true);
  const [savingImportConfig, setSavingImportConfig] = useState(false);
  const [savingExportConfig, setSavingExportConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger l'historique des imports/exports
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingJobs(true);
      setError(null);

      try {
        const response = await api.get('/importexporthistory');
        setJobs(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique d\'import/export:', err);
        setError('Impossible de charger l\'historique d\'import/export. Veuillez réessayer plus tard.');
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchHistory();
  }, []);

  // Charger la configuration d'import
  useEffect(() => {
    const fetchImportConfig = async () => {
      setLoadingImportConfig(true);

      try {
        const response = await api.get('/importconfig');
        setImportConfig(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration d\'import:', err);
      } finally {
        setLoadingImportConfig(false);
      }
    };

    fetchImportConfig();
  }, []);

  // Charger la configuration d'export
  useEffect(() => {
    const fetchExportConfig = async () => {
      setLoadingExportConfig(true);

      try {
        const response = await api.get('/exportconfig');
        setExportConfig(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration d\'export:', err);
      } finally {
        setLoadingExportConfig(false);
      }
    };

    fetchExportConfig();
  }, []);

  // Sauvegarder la configuration d'import
  const saveImportConfig = async () => {
    setSavingImportConfig(true);

    try {
      const response = await api.put('/importconfig', importConfig);
      setImportConfig(response.data);

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration d'import a été mise à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la configuration d\'import:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration d'import.",
        variant: "destructive",
      });
    } finally {
      setSavingImportConfig(false);
    }
  };

  // Sauvegarder la configuration d'export
  const saveExportConfig = async () => {
    setSavingExportConfig(true);

    try {
      const response = await api.put('/exportconfig', exportConfig);
      setExportConfig(response.data);

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration d'export a été mise à jour avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la configuration d\'export:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration d'export.",
        variant: "destructive",
      });
    } finally {
      setSavingExportConfig(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.dataType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.fileFormat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge variant="default">Terminé</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partiel</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

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
        <FileText className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import/Export</h1>
          <p className="text-muted-foreground mt-1">Configuration des outils d'échange de données</p>
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
        {/* Configuration d'import */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuration d'import</CardTitle>
              <CardDescription>Paramètres pour l'importation de données</CardDescription>
            </div>
            <Button
              onClick={saveImportConfig}
              disabled={savingImportConfig || loadingImportConfig}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {savingImportConfig ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingImportConfig ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="import-format">Formats autorisés</Label>
                    <Input
                      id="import-format"
                      value={Array.isArray(importConfig.allowedFormats) ? importConfig.allowedFormats.join(', ') : importConfig.allowedFormats}
                      onChange={(e) => setImportConfig({
                        ...importConfig,
                        allowedFormats: e.target.value.split(',').map(format => format.trim())
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-delimiter">Délimiteur CSV</Label>
                    <Input
                      id="import-delimiter"
                      value={importConfig.defaultDelimiter}
                      onChange={(e) => setImportConfig({...importConfig, defaultDelimiter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="import-encoding">Encodage par défaut</Label>
                    <Input
                      id="import-encoding"
                      value={importConfig.defaultEncoding}
                      onChange={(e) => setImportConfig({...importConfig, defaultEncoding: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-max-size">Taille maximale (octets)</Label>
                    <Input
                      id="import-max-size"
                      type="number"
                      value={importConfig.maxFileSize}
                      onChange={(e) => setImportConfig({...importConfig, maxFileSize: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="validate-import"
                    checked={importConfig.validateBeforeImport}
                    onCheckedChange={(checked) => setImportConfig({...importConfig, validateBeforeImport: checked})}
                  />
                  <Label htmlFor="validate-import">Valider les données avant import</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ignore-errors"
                    checked={importConfig.ignoreErrors}
                    onCheckedChange={(checked) => setImportConfig({...importConfig, ignoreErrors: checked})}
                  />
                  <Label htmlFor="ignore-errors">Ignorer les erreurs et continuer</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="import-notifications"
                    checked={importConfig.emailNotifications}
                    onCheckedChange={(checked) => setImportConfig({...importConfig, emailNotifications: checked})}
                  />
                  <Label htmlFor="import-notifications">Notifications par email</Label>
                </div>

                {importConfig.emailNotifications && (
                  <div>
                    <Label htmlFor="import-emails">Emails de notification (séparés par des virgules)</Label>
                    <Input
                      id="import-emails"
                      value={importConfig.notificationEmails ? (Array.isArray(importConfig.notificationEmails) ? importConfig.notificationEmails.join(', ') : importConfig.notificationEmails) : ''}
                      onChange={(e) => setImportConfig({...importConfig, notificationEmails: e.target.value.split(',').map(email => email.trim())})}
                      placeholder="admin@example.com, import@example.com"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Configuration d'export */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configuration d'export</CardTitle>
              <CardDescription>Paramètres pour l'exportation de données</CardDescription>
            </div>
            <Button
              onClick={saveExportConfig}
              disabled={savingExportConfig || loadingExportConfig}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              {savingExportConfig ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingExportConfig ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de la configuration...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-formats">Formats disponibles</Label>
                    <Input
                      id="export-formats"
                      value={Array.isArray(exportConfig.availableFormats) ? exportConfig.availableFormats.join(', ') : exportConfig.availableFormats}
                      onChange={(e) => setExportConfig({
                        ...exportConfig,
                        availableFormats: e.target.value.split(',').map(format => format.trim())
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="export-default-format">Format par défaut</Label>
                    <Input
                      id="export-default-format"
                      value={exportConfig.defaultFormat}
                      onChange={(e) => setExportConfig({...exportConfig, defaultFormat: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-delimiter">Délimiteur CSV</Label>
                    <Input
                      id="export-delimiter"
                      value={exportConfig.defaultDelimiter}
                      onChange={(e) => setExportConfig({...exportConfig, defaultDelimiter: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="export-encoding">Encodage par défaut</Label>
                    <Input
                      id="export-encoding"
                      value={exportConfig.defaultEncoding}
                      onChange={(e) => setExportConfig({...exportConfig, defaultEncoding: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="export-date-format">Format de date</Label>
                    <Input
                      id="export-date-format"
                      value={exportConfig.dateFormat}
                      onChange={(e) => setExportConfig({...exportConfig, dateFormat: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="export-max-rows">Nombre max. de lignes</Label>
                    <Input
                      id="export-max-rows"
                      type="number"
                      value={exportConfig.maxRows || ''}
                      onChange={(e) => setExportConfig({...exportConfig, maxRows: e.target.value ? parseInt(e.target.value) : undefined})}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-headers"
                    checked={exportConfig.includeHeaders}
                    onCheckedChange={(checked) => setExportConfig({...exportConfig, includeHeaders: checked})}
                  />
                  <Label htmlFor="include-headers">Inclure les en-têtes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="compress-exports"
                    checked={exportConfig.compressExports}
                    onCheckedChange={(checked) => setExportConfig({...exportConfig, compressExports: checked})}
                  />
                  <Label htmlFor="compress-exports">Compresser les fichiers exportés</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="export-notifications"
                    checked={exportConfig.emailNotifications}
                    onCheckedChange={(checked) => setExportConfig({...exportConfig, emailNotifications: checked})}
                  />
                  <Label htmlFor="export-notifications">Notifications par email</Label>
                </div>

                {exportConfig.emailNotifications && (
                  <div>
                    <Label htmlFor="export-emails">Emails de notification (séparés par des virgules)</Label>
                    <Input
                      id="export-emails"
                      value={exportConfig.notificationEmails ? (Array.isArray(exportConfig.notificationEmails) ? exportConfig.notificationEmails.join(', ') : exportConfig.notificationEmails) : ''}
                      onChange={(e) => setExportConfig({...exportConfig, notificationEmails: e.target.value.split(',').map(email => email.trim())})}
                      placeholder="admin@example.com, export@example.com"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Historique */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Historique des opérations</CardTitle>
              <CardDescription>Journal des imports/exports récents</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Nouvel import
              </Button>
              <Button className="bg-ivory-orange hover:bg-ivory-orange/90">
                <Download className="h-4 w-4 mr-2" />
                Nouvel export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input
                placeholder="Rechercher une opération..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loadingJobs ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                <span className="ml-2">Chargement de l'historique...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">Aucun historique d'import/export disponible</div>
                <div className="text-sm">Les opérations d'import/export seront enregistrées ici</div>
              </div>
            ) : (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Données</TableHead>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Enregistrements</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {job.operationType === 'import' ? <FileInput className="h-4 w-4" /> : <FileOutput className="h-4 w-4" />}
                            {job.operationType === 'import' ? 'Import' : 'Export'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.fileFormat}</Badge>
                        </TableCell>
                        <TableCell>{job.dataType}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={job.fileName}>
                          {job.fileName}
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>{formatDate(job.timestamp)}</TableCell>
                        <TableCell>{job.recordCount}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-24 flex flex-col items-center justify-center gap-2">
            <Upload className="h-6 w-6" />
            <span>Nouvel import</span>
          </Button>
          <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-ivory-orange hover:bg-ivory-orange/90">
            <Download className="h-6 w-6" />
            <span>Nouvel export</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportExportSettings;