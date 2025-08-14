import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Printer, Plus, Trash2, TestTube2, Loader2, AlertCircle, Check } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { api } from '../../services';

interface PrinterConfig {
  id: string;
  name: string;
  type: string;
  connection: string;
  address?: string;
  port?: number;
  driver?: string;
  isDefault: boolean;
  status?: string;
  lastModified?: string;
}

const PrintersSettings: React.FC = () => {
  const { toast } = useToast();
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<PrinterConfig | null>(null);
  const [deletingPrinter, setDeletingPrinter] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);
  const [testingPrinter, setTestingPrinter] = useState<string | null>(null);
  const [showTestResultDialog, setShowTestResultDialog] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; printer: string } | null>(null);

  const [newPrinter, setNewPrinter] = useState({
    name: '',
    type: 'Laser',
    connection: 'Réseau',
    address: '',
    port: 9100,
    driver: ''
  });

  // Charger les imprimantes depuis l'API
  useEffect(() => {
    const fetchPrinters = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/printers');
        setPrinters(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des imprimantes:', err);
        setError('Impossible de charger les imprimantes. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrinters();
  }, []);

  const handleAddPrinter = async () => {
    if (!newPrinter.name) return;

    try {
      const response = await api.post('/printers', {
        name: newPrinter.name,
        type: newPrinter.type,
        connection: newPrinter.connection,
        address: newPrinter.address,
        port: newPrinter.port,
        driver: newPrinter.driver,
        isDefault: printers.length === 0,
        status: 'active',
        options: {
          paper_size: 'A4',
          color_mode: 'color',
          dpi: 600,
          tray: 'auto'
        },
        capabilities: {
          duplex: true,
          color: true,
          staple: false,
          scan: false,
          fax: false,
          paper_sizes: ['A4', 'A5', 'Letter', 'Legal']
        }
      });

      // Ajouter la nouvelle imprimante à la liste
      setPrinters([...printers, response.data]);

      // Réinitialiser le formulaire
      setNewPrinter({
        name: '',
        type: 'Laser',
        connection: 'Réseau',
        address: '',
        port: 9100,
        driver: ''
      });

      toast({
        title: "Imprimante ajoutée",
        description: "L'imprimante a été ajoutée avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'imprimante:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'imprimante.",
        variant: "destructive",
      });
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (printer: PrinterConfig) => {
    setPrinterToDelete(printer);
    setShowDeleteDialog(true);
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);

    try {
      const response = await api.patch(`/printers/${id}/setdefault`);

      // Mettre à jour l'état local
      setPrinters(printers.map(printer => ({
        ...printer,
        isDefault: printer.id === id
      })));

      toast({
        title: "Imprimante par défaut",
        description: `L'imprimante "${response.data.name}" a été définie comme imprimante par défaut.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors de la définition de l\'imprimante par défaut:', err);
      toast({
        title: "Erreur",
        description: "Impossible de définir cette imprimante comme imprimante par défaut.",
        variant: "destructive",
      });
    } finally {
      setSettingDefault(null);
    }
  };

  const handleDeletePrinter = async () => {
    if (!printerToDelete) return;

    setDeletingPrinter(printerToDelete.id);

    try {
      await api.delete(`/printers/${printerToDelete.id}`);

      // Mettre à jour l'état local
      setPrinters(printers.filter(printer => printer.id !== printerToDelete.id));

      // Fermer la boîte de dialogue
      setShowDeleteDialog(false);
      setPrinterToDelete(null);

      toast({
        title: "Imprimante supprimée",
        description: "L'imprimante a été supprimée avec succès.",
        variant: "default",
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'imprimante:', err);

      // Afficher un message d'erreur spécifique si l'imprimante est par défaut
      if (err.response && err.response.status === 400) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'imprimante par défaut. Veuillez d'abord définir une autre imprimante comme imprimante par défaut.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'imprimante.",
          variant: "destructive",
        });
      }
    } finally {
      setDeletingPrinter(null);
    }
  };

  const handleTestPrinter = async (id: string) => {
    setTestingPrinter(id);

    try {
      const response = await api.post(`/printers/${id}/test`);

      // Afficher le résultat du test
      setTestResult(response.data);
      setShowTestResultDialog(true);

      toast({
        title: "Test d'impression",
        description: "Le test d'impression a été envoyé avec succès.",
        variant: "default",
      });
    } catch (err) {
      console.error('Erreur lors du test d\'impression:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le test d'impression.",
        variant: "destructive",
      });
    } finally {
      setTestingPrinter(null);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Printer className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imprimantes</h1>
          <p className="text-muted-foreground mt-1">Configurez les imprimantes pour l'impression des documents</p>
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

      {/* Formulaire d'ajout */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ajouter une imprimante</CardTitle>
          <CardDescription>Configurez une nouvelle imprimante pour votre système</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Nom de l'imprimante"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newPrinter.type}
                  onValueChange={(value) => setNewPrinter({...newPrinter, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laser">Laser</SelectItem>
                    <SelectItem value="Jet d'encre">Jet d'encre</SelectItem>
                    <SelectItem value="Thermique">Thermique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="connection" className="text-right">
                  Connexion
                </Label>
                <Select
                  value={newPrinter.connection}
                  onValueChange={(value) => setNewPrinter({...newPrinter, connection: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez une connexion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Réseau">Réseau</SelectItem>
                    <SelectItem value="USB">USB</SelectItem>
                    <SelectItem value="WiFi">WiFi</SelectItem>
                    <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(newPrinter.connection === 'Réseau' || newPrinter.connection === 'WiFi') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Adresse IP
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={newPrinter.address}
                    onChange={(e) => setNewPrinter({...newPrinter, address: e.target.value})}
                    className="col-span-3"
                    placeholder="192.168.1.100"
                  />
                </div>
              )}

              {(newPrinter.connection === 'Réseau' || newPrinter.connection === 'WiFi') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port" className="text-right">
                    Port
                  </Label>
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    value={newPrinter.port}
                    onChange={(e) => setNewPrinter({...newPrinter, port: parseInt(e.target.value)})}
                    className="col-span-3"
                    placeholder="9100"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="driver" className="text-right">
                  Pilote
                </Label>
                <Input
                  id="driver"
                  name="driver"
                  value={newPrinter.driver}
                  onChange={(e) => setNewPrinter({...newPrinter, driver: e.target.value})}
                  className="col-span-3"
                  placeholder="Nom du pilote d'imprimante"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-ivory-orange hover:bg-ivory-orange/90"
                  onClick={handleAddPrinter}
                  disabled={!newPrinter.name || (newPrinter.connection === 'Réseau' && !newPrinter.address)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter l'imprimante
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des imprimantes */}
      <Card>
        <CardHeader>
          <CardTitle>Imprimantes configurées</CardTitle>
          <CardDescription>Liste des imprimantes disponibles pour l'impression</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              <span className="ml-2">Chargement des imprimantes...</span>
            </div>
          ) : printers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="mb-2">Aucune imprimante configurée</div>
              <div className="text-sm">Ajoutez une imprimante pour commencer</div>
            </div>
          ) : (
            <div className="space-y-4">
              {printers.map((printer) => (
                <div key={printer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{printer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {printer.type} • {printer.connection}
                      {printer.address && ` • ${printer.address}`}
                      {printer.port && `:${printer.port}`}
                    </div>
                    {printer.lastModified && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Dernière modification: {printer.lastModified}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {printer.isDefault ? (
                      <Badge variant="default">Par défaut</Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(printer.id)}
                        disabled={settingDefault === printer.id}
                      >
                        {settingDefault === printer.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Définition...
                          </>
                        ) : (
                          <>Définir par défaut</>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTestPrinter(printer.id)}
                      disabled={testingPrinter === printer.id}
                      title="Tester l'imprimante"
                    >
                      {testingPrinter === printer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(printer)}
                      disabled={deletingPrinter === printer.id}
                      title="Supprimer l'imprimante"
                    >
                      {deletingPrinter === printer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'imprimante</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette imprimante ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {printerToDelete && (
            <div className="py-4">
              <p className="font-medium">{printerToDelete.name}</p>
              <p className="text-sm text-muted-foreground">Type: {printerToDelete.type}</p>
              <p className="text-sm text-muted-foreground">Connexion: {printerToDelete.connection}</p>
              {printerToDelete.isDefault && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Attention</AlertTitle>
                  <AlertDescription>
                    Cette imprimante est définie comme imprimante par défaut. Vous devez d'abord définir une autre imprimante comme imprimante par défaut avant de pouvoir la supprimer.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePrinter}
              disabled={deletingPrinter !== null || (printerToDelete && printerToDelete.isDefault)}
            >
              {deletingPrinter !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de résultat de test d'impression */}
      <Dialog open={showTestResultDialog} onOpenChange={setShowTestResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat du test d'impression</DialogTitle>
            <DialogDescription>
              Résultat du test d'impression envoyé à l'imprimante.
            </DialogDescription>
          </DialogHeader>
          {testResult && (
            <div className="py-4 flex flex-col items-center">
              <div className={`p-4 rounded-full mb-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {testResult.success ? (
                  <Check className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className="text-center mb-4">
                {testResult.message}
              </p>
              <p className="text-sm text-muted-foreground">
                Imprimante: {testResult.printer}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTestResultDialog(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrintersSettings;
