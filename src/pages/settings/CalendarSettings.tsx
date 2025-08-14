import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Calendar, Clock, Globe, CalendarDays, CalendarCheck, Plus, Loader2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

interface Holiday {
  id: string;
  name: string;
  date: string;
  country: string;
  recurring: boolean;
  type: string;
  description: string;
  active: boolean;
}

interface CalendarConfig {
  id: string;
  timezone: string;
  workHoursStart: string;
  workHoursEnd: string;
  weekStart: string;
  dateFormat: string;
  timeFormat: string;
  workDays: string[];
  advancedSettings: {
    showWeekNumbers: boolean;
    firstDayOfYear: number;
    minimalDaysInFirstWeek: number;
    workWeekStart: number;
    workWeekEnd: number;
    defaultView: string;
    defaultDuration: number;
    slotDuration: number;
    snapDuration: number;
  };
}

interface CalendarIntegration {
  id: string;
  type: string;
  name: string;
  userId: string | null;
  userName: string | null;
  lastSync: string | null;
  lastSyncStatus: string | null;
  active: boolean;
}

const CalendarSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);

  // États locaux pour l'édition
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [workHours, setWorkHours] = useState({ start: '08:00', end: '18:00' });
  const [weekStart, setWeekStart] = useState('monday');

  // États pour la confirmation de suppression
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // États pour l'ajout d'un jour férié
  const [showAddHolidayDialog, setShowAddHolidayDialog] = useState(false);
  const [newHoliday, setNewHoliday] = useState<{
    name: string;
    date: string;
    country: string;
    recurring: boolean;
    type: string;
    description: string;
  }>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    country: 'France',
    recurring: false,
    type: 'national',
    description: ''
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer la configuration du calendrier
        const configResponse = await axios.get(`${API_BASE_URL}/calendarconfig`);
        setCalendarConfig(configResponse.data);
        setTimezone(configResponse.data.timezone);
        setWorkHours({
          start: configResponse.data.workHoursStart,
          end: configResponse.data.workHoursEnd
        });
        setWeekStart(configResponse.data.weekStart);

        // Récupérer les jours fériés
        const holidaysResponse = await axios.get(`${API_BASE_URL}/holidays`);
        setHolidays(holidaysResponse.data);

        // Récupérer les intégrations de calendrier
        const integrationsResponse = await axios.get(`${API_BASE_URL}/calendarintegrations`);
        setIntegrations(integrationsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données du calendrier:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour sauvegarder les modifications de la configuration
  const saveCalendarConfig = async () => {
    try {
      setLoading(true);

      if (!calendarConfig) return;

      const updatedConfig = {
        ...calendarConfig,
        timezone,
        workHoursStart: workHours.start,
        workHoursEnd: workHours.end,
        weekStart
      };

      await axios.put(`${API_BASE_URL}/calendarconfig`, updatedConfig);
      setCalendarConfig(updatedConfig);

      setLoading(false);
      toast({
        title: "Configuration sauvegardée",
        description: "Configuration du calendrier enregistrée avec succès",
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration",
        variant: "destructive",
      });
    }
  };

  // Fonction pour ajouter un jour férié
  const addHoliday = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE_URL}/holidays`, newHoliday);
      setHolidays([...holidays, response.data]);

      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setNewHoliday({
        name: '',
        date: new Date().toISOString().split('T')[0],
        country: 'France',
        recurring: false,
        type: 'national',
        description: ''
      });
      setShowAddHolidayDialog(false);

      toast({
        title: "Jour férié ajouté",
        description: "Le jour férié a été ajouté avec succès",
        variant: "default",
      });

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du jour férié:', error);
      setLoading(false);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du jour férié",
        variant: "destructive",
      });
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer un jour férié
  const handleDeleteHoliday = async () => {
    if (!holidayToDelete) return;

    setIsDeleting(true);

    try {
      await axios.delete(`${API_BASE_URL}/holidays/${holidayToDelete.id}`);

      // Mettre à jour l'état local
      setHolidays(holidays.filter(h => h.id !== holidayToDelete.id));

      toast({
        title: "Jour férié supprimé",
        description: "Le jour férié a été supprimé avec succès",
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setHolidayToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du jour férié:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du jour férié",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendrier</h1>
          <p className="text-muted-foreground mt-1">Configuration du système de calendrier</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Paramètres généraux */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>Configuration de base du calendrier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-2"
                />
              </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="work-start">Heure de début</Label>
                <Input
                  id="work-start"
                  type="time"
                  value={workHours.start}
                  onChange={(e) => setWorkHours({...workHours, start: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="work-end">Heure de fin</Label>
                <Input
                  id="work-end"
                  type="time"
                  value={workHours.end}
                  onChange={(e) => setWorkHours({...workHours, end: e.target.value})}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Premier jour de la semaine</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={weekStart === 'monday' ? 'default' : 'outline'}
                  onClick={() => setWeekStart('monday')}
                >
                  Lundi
                </Button>
                <Button
                  variant={weekStart === 'sunday' ? 'default' : 'outline'}
                  onClick={() => setWeekStart('sunday')}
                >
                  Dimanche
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jours fériés */}
        <Card>
          <CardHeader>
            <CardTitle>Jours fériés</CardTitle>
            <CardDescription>Gestion des jours fériés et congés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {holidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{holiday.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {holiday.date} • {holiday.country} • {holiday.type}
                      </div>
                      {holiday.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {holiday.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={holiday.recurring ? 'default' : 'outline'}>
                      {holiday.recurring ? 'Récurrent' : 'Ponctuel'}
                    </Badge>
                    <Badge variant={holiday.active ? 'success' : 'destructive'}>
                      {holiday.active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(holiday)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="mt-4 bg-ivory-orange hover:bg-ivory-orange/90"
              onClick={() => setShowAddHolidayDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un jour férié
            </Button>
          </CardContent>
        </Card>

        {/* Intégrations */}
        <Card>
          <CardHeader>
            <CardTitle>Intégrations</CardTitle>
            <CardDescription>Connexion avec des calendriers externes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.length > 0 ? (
              integrations.map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {integration.userName ? `Connecté à ${integration.userName}` : 'Non connecté'}
                      </div>
                      {integration.lastSync && (
                        <div className="text-xs text-muted-foreground">
                          Dernière synchronisation: {new Date(integration.lastSync).toLocaleString()}
                          {integration.lastSyncStatus && ` (${integration.lastSyncStatus})`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Badge variant={integration.active ? 'success' : 'outline'}>
                      {integration.active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Button variant="outline" className="ml-2">
                      {integration.userName ? 'Déconnecter' : 'Connecter'}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Google Calendar</div>
                      <div className="text-sm text-muted-foreground">
                        Non connecté
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    Connecter
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Outlook Calendar</div>
                      <div className="text-sm text-muted-foreground">
                        Non connecté
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    Connecter
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end mt-6">
          <Button
            className="bg-ivory-orange hover:bg-ivory-orange/90"
            onClick={saveCalendarConfig}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </div>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer le jour férié"
        description="Êtes-vous sûr de vouloir supprimer ce jour férié ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteHoliday}
      >
        {holidayToDelete && (
          <div>
            <p className="font-medium">{holidayToDelete.name}</p>
            <p className="text-sm text-muted-foreground">
              Date: {holidayToDelete.date}
            </p>
            <p className="text-sm text-muted-foreground">
              Pays: {holidayToDelete.country}
            </p>
            <p className="text-sm text-muted-foreground">
              Type: <Badge variant="outline">{holidayToDelete.type}</Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Récurrent: <Badge variant={holidayToDelete.recurring ? 'default' : 'outline'}>
                {holidayToDelete.recurring ? 'Oui' : 'Non'}
              </Badge>
            </p>
          </div>
        )}
      </ConfirmationDialog>

      {/* Boîte de dialogue d'ajout de jour férié */}
      <Dialog open={showAddHolidayDialog} onOpenChange={setShowAddHolidayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un jour férié</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau jour férié.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="holiday-name" className="text-right">
                Nom
              </Label>
              <Input
                id="holiday-name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                className="col-span-3"
                placeholder="Nom du jour férié"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="holiday-date" className="text-right">
                Date
              </Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="holiday-country" className="text-right">
                Pays
              </Label>
              <Input
                id="holiday-country"
                value={newHoliday.country}
                onChange={(e) => setNewHoliday({...newHoliday, country: e.target.value})}
                className="col-span-3"
                placeholder="Pays"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="holiday-type" className="text-right">
                Type
              </Label>
              <Input
                id="holiday-type"
                value={newHoliday.type}
                onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value})}
                className="col-span-3"
                placeholder="Type (ex: national, régional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="holiday-description" className="text-right">
                Description
              </Label>
              <Input
                id="holiday-description"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({...newHoliday, description: e.target.value})}
                className="col-span-3"
                placeholder="Description (optionnelle)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Récurrent
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="holiday-recurring"
                  checked={newHoliday.recurring}
                  onCheckedChange={(checked) => setNewHoliday({...newHoliday, recurring: checked})}
                />
                <Label htmlFor="holiday-recurring">
                  {newHoliday.recurring ? 'Oui' : 'Non'}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddHolidayDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={addHoliday}
              disabled={!newHoliday.name || !newHoliday.date}
              className="bg-ivory-orange hover:bg-ivory-orange/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarSettings;