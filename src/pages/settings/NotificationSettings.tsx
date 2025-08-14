import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Bell, Mail, MessageSquare, Smartphone, Globe, Plus, Trash2, Edit, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

// Types pour les notifications
interface NotificationChannel {
  id: string;
  name: string;
  type: string;
  description: string;
  config: any;
  enabled: boolean;
  displayOrder: number;
  icon: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  event: string;
  subject: string;
  content: string;
  htmlContent: string;
  variables: string[];
  active: boolean;
  category: string;
  language: string;
  channels: {
    id: string;
    name: string;
    type: string;
  }[];
}

interface NotificationPreference {
  id: string;
  userId: string;
  userName: string;
  eventType: string;
  enabledChannels: string[];
  frequency: string;
  preferredTime: string | null;
  preferredDay: string | null;
  enabled: boolean;
}

interface Notification {
  id: string;
  userId: string;
  userName: string;
  templateId: string | null;
  templateName: string | null;
  type: string;
  title: string;
  content: string;
  data: any;
  channel: string;
  status: string;
  readAt: string | null;
  scheduledFor: string | null;
  priority: string;
  actionUrl: string;
  actionText: string;
  createdAt: string;
}

interface NotificationConfig {
  id: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  webhookEnabled: boolean;
  maxRetries: number;
  retryDelay: number;
  retentionPeriod: number;
  maxNotificationsPerDay: number;
  batchingEnabled: boolean;
  batchingInterval: number;
  advancedSettings: any;
}

const NotificationSettings: React.FC = () => {
  // États pour les données
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<NotificationConfig | null>(null);

  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('general');

  // États pour les modales
  const [addChannelOpen, setAddChannelOpen] = useState(false);
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour le nouveau canal
  const [newChannel, setNewChannel] = useState<{
    name: string;
    type: string;
    description: string;
    enabled: boolean;
  }>({
    name: '',
    type: 'email',
    description: '',
    enabled: true
  });

  // États pour le nouveau modèle
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    event: string;
    subject: string;
    content: string;
    htmlContent: string;
    active: boolean;
    category: string;
    channelIds: string[];
  }>({
    name: '',
    event: '',
    subject: '',
    content: '',
    htmlContent: '',
    active: true,
    category: '',
    channelIds: []
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les canaux de notification
        const channelsResponse = await axios.get(`${API_BASE_URL}/notificationchannels`);
        setChannels(channelsResponse.data);

        // Récupérer les modèles de notification
        const templatesResponse = await axios.get(`${API_BASE_URL}/notificationtemplates`);
        setTemplates(templatesResponse.data);

        // Récupérer les préférences de notification
        const preferencesResponse = await axios.get(`${API_BASE_URL}/notificationpreferences`);
        setPreferences(preferencesResponse.data);

        // Récupérer les notifications
        const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`);
        setNotifications(notificationsResponse.data);

        // Récupérer la configuration des notifications
        const configResponse = await axios.get(`${API_BASE_URL}/notificationconfig`);
        setConfig(configResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de notification:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour sauvegarder la configuration
  const saveConfig = async () => {
    if (!config) return;

    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/notificationconfig`, config);
      setLoading(false);
      alert('Configuration enregistrée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      setLoading(false);
      alert('Erreur lors de la sauvegarde de la configuration');
    }
  };

  // Fonction pour obtenir l'icône d'un canal
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <Smartphone className="h-5 w-5" />;
      case 'in_app':
        return <Bell className="h-5 w-5" />;
      case 'webhook':
        return <Globe className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  // Fonction pour obtenir la couleur d'un statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'bg-green-500';
      case 'delivered':
        return 'bg-blue-500';
      case 'sent':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Fonction pour ajouter un canal
  const handleAddChannel = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validation
      if (!newChannel.name || !newChannel.type) {
        setError('Le nom et le type sont requis');
        setLoading(false);
        return;
      }

      // Appel API
      const response = await axios.post(`${API_BASE_URL}/notificationchannels`, {
        name: newChannel.name,
        type: newChannel.type,
        description: newChannel.description,
        enabled: newChannel.enabled
      });

      // Mise à jour de l'état
      setChannels([...channels, response.data]);

      // Réinitialisation
      setNewChannel({
        name: '',
        type: 'email',
        description: '',
        enabled: true
      });

      setAddChannelOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du canal:', error);
      setError('Erreur lors de l\'ajout du canal');
      setLoading(false);
    }
  };

  // Fonction pour ajouter un modèle
  const handleAddTemplate = async () => {
    try {
      setError(null);
      setLoading(true);

      // Validation
      if (!newTemplate.name || !newTemplate.event || !newTemplate.content) {
        setError('Le nom, l\'événement et le contenu sont requis');
        setLoading(false);
        return;
      }

      // Appel API
      const response = await axios.post(`${API_BASE_URL}/notificationtemplates`, {
        name: newTemplate.name,
        event: newTemplate.event,
        subject: newTemplate.subject,
        content: newTemplate.content,
        htmlContent: newTemplate.htmlContent,
        active: newTemplate.active,
        category: newTemplate.category,
        channelIds: newTemplate.channelIds
      });

      // Mise à jour de l'état
      setTemplates([...templates, response.data]);

      // Réinitialisation
      setNewTemplate({
        name: '',
        event: '',
        subject: '',
        content: '',
        htmlContent: '',
        active: true,
        category: '',
        channelIds: []
      });

      setAddTemplateOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du modèle:', error);
      setError('Erreur lors de l\'ajout du modèle');
      setLoading(false);
    }
  };

  // Fonction pour gérer le changement des canaux sélectionnés pour un modèle
  const handleChannelSelectionChange = (channelId: string) => {
    const currentChannels = [...newTemplate.channelIds];

    if (currentChannels.includes(channelId)) {
      // Retirer le canal
      setNewTemplate({
        ...newTemplate,
        channelIds: currentChannels.filter(id => id !== channelId)
      });
    } else {
      // Ajouter le canal
      setNewTemplate({
        ...newTemplate,
        channelIds: [...currentChannels, channelId]
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Configuration du système de notifications</p>
        </div>
      </div>

      {loading && !config ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="channels">Canaux</TabsTrigger>
            <TabsTrigger value="templates">Modèles</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general" className="space-y-6">
            {config && (
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres généraux</CardTitle>
                  <CardDescription>Configuration de base des notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-enabled">Notifications par email</Label>
                        <Switch
                          id="email-enabled"
                          checked={config.emailEnabled}
                          onCheckedChange={(checked) => setConfig({...config, emailEnabled: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-enabled">Notifications par SMS</Label>
                        <Switch
                          id="sms-enabled"
                          checked={config.smsEnabled}
                          onCheckedChange={(checked) => setConfig({...config, smsEnabled: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="in-app-enabled">Notifications dans l'application</Label>
                        <Switch
                          id="in-app-enabled"
                          checked={config.inAppEnabled}
                          onCheckedChange={(checked) => setConfig({...config, inAppEnabled: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="webhook-enabled">Notifications webhook</Label>
                        <Switch
                          id="webhook-enabled"
                          checked={config.webhookEnabled}
                          onCheckedChange={(checked) => setConfig({...config, webhookEnabled: checked})}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="max-retries">Nombre maximum de tentatives</Label>
                        <Input
                          id="max-retries"
                          type="number"
                          value={config.maxRetries}
                          onChange={(e) => setConfig({...config, maxRetries: parseInt(e.target.value)})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="retry-delay">Délai entre les tentatives (minutes)</Label>
                        <Input
                          id="retry-delay"
                          type="number"
                          value={config.retryDelay}
                          onChange={(e) => setConfig({...config, retryDelay: parseInt(e.target.value)})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="retention-period">Durée de conservation (jours)</Label>
                        <Input
                          id="retention-period"
                          type="number"
                          value={config.retentionPeriod}
                          onChange={(e) => setConfig({...config, retentionPeriod: parseInt(e.target.value)})}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Regroupement des notifications</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="batching-enabled">Activer le regroupement</Label>
                        <Switch
                          id="batching-enabled"
                          checked={config.batchingEnabled}
                          onCheckedChange={(checked) => setConfig({...config, batchingEnabled: checked})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="batching-interval">Intervalle de regroupement (minutes)</Label>
                        <Input
                          id="batching-interval"
                          type="number"
                          value={config.batchingInterval}
                          onChange={(e) => setConfig({...config, batchingInterval: parseInt(e.target.value)})}
                          className="mt-2"
                          disabled={!config.batchingEnabled}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="bg-ivory-orange hover:bg-ivory-orange/90"
                      onClick={saveConfig}
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onglet Canaux */}
          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Canaux de notification</CardTitle>
                  <CardDescription>Gestion des canaux de communication</CardDescription>
                </div>
                <Button
                  className="bg-ivory-orange hover:bg-ivory-orange/90"
                  onClick={() => setAddChannelOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un canal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getChannelIcon(channel.type)}
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {channel.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={channel.enabled ? 'default' : 'outline'}>
                          {channel.enabled ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Modèles */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Modèles de notification</CardTitle>
                  <CardDescription>Gestion des modèles de contenu</CardDescription>
                </div>
                <Button
                  className="bg-ivory-orange hover:bg-ivory-orange/90"
                  onClick={() => setAddTemplateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un modèle
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{template.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.active ? 'default' : 'outline'}>
                            {template.active ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Événement: {template.event}
                      </div>
                      <div className="text-sm mt-2">
                        <strong>Sujet:</strong> {template.subject}
                      </div>
                      <div className="text-sm mt-1">
                        <strong>Contenu:</strong> {template.content.substring(0, 100)}...
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.channels.map((channel) => (
                          <Badge key={channel.id} variant="outline" className="text-xs">
                            {channel.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Préférences */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notification</CardTitle>
                <CardDescription>Gestion des préférences par utilisateur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {preferences.length > 0 ? (
                    preferences.map((preference) => (
                      <div key={preference.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{preference.userName}</div>
                          <Badge variant={preference.enabled ? 'default' : 'outline'}>
                            {preference.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Événement: {preference.eventType}
                        </div>
                        <div className="text-sm mt-2">
                          <strong>Fréquence:</strong> {preference.frequency}
                          {preference.frequency !== 'immediate' && preference.preferredTime && (
                            <span> à {preference.preferredTime}</span>
                          )}
                          {preference.frequency === 'weekly' && preference.preferredDay && (
                            <span> le {preference.preferredDay}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {preference.enabledChannels.map((channelId) => {
                            const channel = channels.find(c => c.id === channelId);
                            return (
                              <Badge key={channelId} variant="outline" className="text-xs">
                                {channel ? channel.name : channelId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune préférence de notification configurée
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des notifications</CardTitle>
                <CardDescription>Notifications envoyées récemment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{notification.title}</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(notification.status)}`}></div>
                            <span className="text-xs text-muted-foreground">{notification.status}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Destinataire: {notification.userName} • Canal: {notification.channel}
                        </div>
                        <div className="text-sm mt-2">
                          {notification.content.substring(0, 100)}
                          {notification.content.length > 100 && '...'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Envoyé le {new Date(notification.createdAt).toLocaleString()}
                          {notification.readAt && ` • Lu le ${new Date(notification.readAt).toLocaleString()}`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune notification dans l'historique
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Modale d'ajout de canal */}
      <Dialog open={addChannelOpen} onOpenChange={setAddChannelOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un canal de notification</DialogTitle>
            <DialogDescription>
              Créez un nouveau canal pour envoyer des notifications.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel-name" className="text-right">
                Nom
              </Label>
              <Input
                id="channel-name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                className="col-span-3"
                placeholder="Email principal"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel-type" className="text-right">
                Type
              </Label>
              <Select
                value={newChannel.type}
                onValueChange={(value) => setNewChannel({...newChannel, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="in_app">Application</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="channel-description"
                value={newChannel.description}
                onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                className="col-span-3"
                placeholder="Description du canal"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel-enabled" className="text-right">
                Activé
              </Label>
              <div className="flex items-center col-span-3">
                <Switch
                  id="channel-enabled"
                  checked={newChannel.enabled}
                  onCheckedChange={(checked) => setNewChannel({...newChannel, enabled: checked})}
                />
                <span className="ml-2">{newChannel.enabled ? 'Oui' : 'Non'}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddChannelOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-ivory-orange hover:bg-ivory-orange/90"
              onClick={handleAddChannel}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale d'ajout de modèle */}
      <Dialog open={addTemplateOpen} onOpenChange={setAddTemplateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un modèle de notification</DialogTitle>
            <DialogDescription>
              Créez un nouveau modèle pour définir le contenu des notifications.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Nom
              </Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="col-span-3"
                placeholder="Nouveau message"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-event" className="text-right">
                Événement
              </Label>
              <Input
                id="template-event"
                value={newTemplate.event}
                onChange={(e) => setNewTemplate({...newTemplate, event: e.target.value})}
                className="col-span-3"
                placeholder="message.received"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-subject" className="text-right">
                Sujet
              </Label>
              <Input
                id="template-subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                className="col-span-3"
                placeholder="Vous avez reçu un nouveau message"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-content" className="text-right">
                Contenu
              </Label>
              <Textarea
                id="template-content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                className="col-span-3"
                placeholder="Contenu de la notification"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-html-content" className="text-right">
                Contenu HTML
              </Label>
              <Textarea
                id="template-html-content"
                value={newTemplate.htmlContent}
                onChange={(e) => setNewTemplate({...newTemplate, htmlContent: e.target.value})}
                className="col-span-3"
                placeholder="<p>Contenu HTML de la notification</p>"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-category" className="text-right">
                Catégorie
              </Label>
              <Input
                id="template-category"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                className="col-span-3"
                placeholder="communication"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-active" className="text-right">
                Actif
              </Label>
              <div className="flex items-center col-span-3">
                <Switch
                  id="template-active"
                  checked={newTemplate.active}
                  onCheckedChange={(checked) => setNewTemplate({...newTemplate, active: checked})}
                />
                <span className="ml-2">{newTemplate.active ? 'Oui' : 'Non'}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Canaux
              </Label>
              <div className="col-span-3 space-y-2">
                {channels.map((channel) => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`channel-${channel.id}`}
                      checked={newTemplate.channelIds.includes(channel.id)}
                      onCheckedChange={() => handleChannelSelectionChange(channel.id)}
                    />
                    <Label htmlFor={`channel-${channel.id}`} className="cursor-pointer">
                      {channel.name}
                    </Label>
                  </div>
                ))}
                {channels.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucun canal disponible. Veuillez d'abord créer un canal.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTemplateOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-ivory-orange hover:bg-ivory-orange/90"
              onClick={handleAddTemplate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationSettings;
