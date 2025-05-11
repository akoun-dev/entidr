import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Bell, Mail, Smartphone, Webhook, Plus, Pencil, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in_app' | 'webhook';
  enabled: boolean;
  description: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  event: string;
  channels: string[];
  content: string;
}

const NotificationsSettings: React.FC = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: '1', name: 'Email principal', type: 'email', enabled: true, description: 'Notifications par email' },
    { id: '2', name: 'SMS professionnel', type: 'sms', enabled: true, description: 'Notifications par SMS' },
    { id: '3', name: 'Application', type: 'in_app', enabled: true, description: 'Notifications dans l\'application' },
    { id: '4', name: 'Webhook Slack', type: 'webhook', enabled: false, description: 'Notifications vers Slack' }
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    { id: '1', name: 'Nouveau message', event: 'message.received', channels: ['1', '3'], content: 'Vous avez reçu un nouveau message' },
    { id: '2', name: 'Tâche assignée', event: 'task.assigned', channels: ['1', '2', '3'], content: 'Une nouvelle tâche vous a été assignée' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // États pour la confirmation de suppression
  const [channelToDelete, setChannelToDelete] = useState<NotificationChannel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleChannelStatus = (id: string) => {
    setChannels(channels.map(channel =>
      channel.id === id ? { ...channel, enabled: !channel.enabled } : channel
    ));
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (channel: NotificationChannel) => {
    setChannelToDelete(channel);
    setIsDeleteDialogOpen(true);
  };

  // Supprimer un canal de notification
  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    setIsDeleting(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour l'état local
      setChannels(channels.filter(channel => channel.id !== channelToDelete.id));

      toast({
        title: "Canal supprimé",
        description: "Le canal de notification a été supprimé avec succès.",
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setChannelToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du canal:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le canal de notification.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Configurez les canaux et modèles de notification</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Canaux de notification */}
        <Card>
          <CardHeader>
            <CardTitle>Canaux de notification</CardTitle>
            <CardDescription>Gérez les différents canaux de notification disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input
                placeholder="Rechercher un canal..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChannels.map((channel) => (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {channel.type === 'email' && <Mail className="h-4 w-4" />}
                          {channel.type === 'sms' && <Smartphone className="h-4 w-4" />}
                          {channel.type === 'in_app' && <Bell className="h-4 w-4" />}
                          {channel.type === 'webhook' && <Webhook className="h-4 w-4" />}
                          {channel.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {channel.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{channel.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={() => toggleChannelStatus(channel.id)}
                          />
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            channel.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {channel.enabled ? 'Activé' : 'Désactivé'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(channel)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button className="mt-4 bg-ivory-orange hover:bg-ivory-orange/90">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un canal
            </Button>
          </CardContent>
        </Card>

        {/* Modèles de notification */}
        <Card>
          <CardHeader>
            <CardTitle>Modèles de notification</CardTitle>
            <CardDescription>Configurez les modèles pour différents événements</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Contenu des modèles de notification */}
          </CardContent>
        </Card>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer le canal de notification"
        description="Êtes-vous sûr de vouloir supprimer ce canal de notification ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<AlertTriangle className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteChannel}
      >
        {channelToDelete && (
          <div>
            <p className="font-medium">{channelToDelete.name}</p>
            <p className="text-sm text-muted-foreground">
              Type: <Badge variant="outline">
                {channelToDelete.type === 'email' ? 'Email' :
                 channelToDelete.type === 'sms' ? 'SMS' :
                 channelToDelete.type === 'in_app' ? 'Application' : 'Webhook'}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Description: {channelToDelete.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Statut: <Badge variant={channelToDelete.enabled ? 'default' : 'secondary'}>
                {channelToDelete.enabled ? 'Activé' : 'Désactivé'}
              </Badge>
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default NotificationsSettings;