import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Users, Search, Plus, Pencil, Trash2, Shield, UserPlus, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

// Types pour les groupes
interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isSystem: boolean;
  permissions: string[];
}

// Types pour les permissions
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * Page des paramètres des groupes d'utilisateurs
 * Permet de gérer les groupes et leurs permissions
 */
const GroupsSettings: React.FC = () => {
  const { toast } = useToast();

  // État pour les groupes
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Administrateurs',
      description: 'Accès complet à toutes les fonctionnalités du système',
      memberCount: 2,
      isSystem: true,
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Gestionnaires',
      description: 'Accès à la plupart des fonctionnalités, sans les paramètres système',
      memberCount: 5,
      isSystem: false,
      permissions: ['read_all', 'write_all', 'delete_documents', 'manage_users']
    },
    {
      id: '3',
      name: 'Comptabilité',
      description: 'Accès aux modules financiers et comptables',
      memberCount: 3,
      isSystem: false,
      permissions: ['read_finance', 'write_finance', 'read_reports']
    },
    {
      id: '4',
      name: 'Ressources Humaines',
      description: 'Accès aux modules RH et gestion du personnel',
      memberCount: 2,
      isSystem: false,
      permissions: ['read_hr', 'write_hr', 'read_employees']
    },
    {
      id: '5',
      name: 'Ventes',
      description: 'Accès aux modules de vente et CRM',
      memberCount: 4,
      isSystem: false,
      permissions: ['read_sales', 'write_sales', 'read_customers']
    },
    {
      id: '6',
      name: 'Marketing',
      description: 'Accès aux modules marketing et campagnes',
      memberCount: 2,
      isSystem: false,
      permissions: ['read_marketing', 'write_marketing', 'read_campaigns']
    }
  ]);

  // États pour la confirmation de suppression
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Liste des permissions disponibles
  const [permissions, setPermissions] = useState<Permission[]>([
    { id: 'read_all', name: 'Lecture globale', description: 'Peut lire toutes les données', category: 'Général' },
    { id: 'write_all', name: 'Écriture globale', description: 'Peut modifier toutes les données', category: 'Général' },
    { id: 'delete_documents', name: 'Suppression de documents', description: 'Peut supprimer des documents', category: 'Documents' },
    { id: 'manage_users', name: 'Gestion des utilisateurs', description: 'Peut gérer les utilisateurs', category: 'Administration' },
    { id: 'read_finance', name: 'Lecture finance', description: 'Peut lire les données financières', category: 'Finance' },
    { id: 'write_finance', name: 'Écriture finance', description: 'Peut modifier les données financières', category: 'Finance' },
    { id: 'read_reports', name: 'Lecture rapports', description: 'Peut lire les rapports', category: 'Rapports' },
    { id: 'read_hr', name: 'Lecture RH', description: 'Peut lire les données RH', category: 'RH' },
    { id: 'write_hr', name: 'Écriture RH', description: 'Peut modifier les données RH', category: 'RH' },
    { id: 'read_employees', name: 'Lecture employés', description: 'Peut lire les données des employés', category: 'RH' },
    { id: 'read_sales', name: 'Lecture ventes', description: 'Peut lire les données de vente', category: 'Ventes' },
    { id: 'write_sales', name: 'Écriture ventes', description: 'Peut modifier les données de vente', category: 'Ventes' },
    { id: 'read_customers', name: 'Lecture clients', description: 'Peut lire les données clients', category: 'CRM' },
    { id: 'read_marketing', name: 'Lecture marketing', description: 'Peut lire les données marketing', category: 'Marketing' },
    { id: 'write_marketing', name: 'Écriture marketing', description: 'Peut modifier les données marketing', category: 'Marketing' },
    { id: 'read_campaigns', name: 'Lecture campagnes', description: 'Peut lire les données de campagnes', category: 'Marketing' }
  ]);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');

  // État pour le groupe en cours d'édition
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtrer les groupes en fonction du terme de recherche
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer l'ajout ou la modification d'un groupe
  const handleSaveGroup = (group: Group) => {
    if (editingGroup) {
      // Mise à jour d'un groupe existant
      setGroups(groups.map(g => g.id === group.id ? group : g));
    } else {
      // Ajout d'un nouveau groupe
      setGroups([...groups, { ...group, id: String(groups.length + 1), memberCount: 0 }]);
    }
    setIsDialogOpen(false);
    setEditingGroup(null);
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (group: Group) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la suppression d'un groupe
  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    setIsDeleting(true);

    try {
      // Simuler une suppression
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mettre à jour l'état local
      setGroups(groups.filter(g => g.id !== groupToDelete.id));

      toast({
        title: "Groupe supprimé",
        description: `Le groupe "${groupToDelete.name}" a été supprimé avec succès.`,
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le groupe.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Obtenir les permissions par catégorie
  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};

    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });

    return categories;
  };

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groupes d'utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les groupes et leurs permissions</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des groupes</CardTitle>
            <CardDescription>Gérez les groupes d'utilisateurs et leurs permissions</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingGroup(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un groupe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingGroup ? 'Modifier le groupe' : 'Ajouter un groupe'}</DialogTitle>
                <DialogDescription>
                  {editingGroup
                    ? 'Modifiez les informations du groupe et ses permissions'
                    : 'Remplissez les informations pour ajouter un nouveau groupe'}
                </DialogDescription>
              </DialogHeader>
              <GroupForm
                group={editingGroup || {
                  id: '',
                  name: '',
                  description: '',
                  memberCount: 0,
                  isSystem: false,
                  permissions: []
                }}
                permissions={permissions}
                permissionsByCategory={permissionsByCategory}
                onSave={handleSaveGroup}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un groupe..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tableau des groupes */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Membres</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>{group.memberCount}</TableCell>
                    <TableCell>
                      {group.isSystem ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Système
                        </Badge>
                      ) : (
                        <Badge variant="outline">Personnalisé</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGroup(group);
                            setIsDialogOpen(true);
                          }}
                          disabled={group.isSystem}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(group)}
                          disabled={group.isSystem || (isDeleting && groupToDelete?.id === group.id)}
                        >
                          {isDeleting && groupToDelete?.id === group.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer le groupe"
        description="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<Trash2 className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteGroup}
      >
        {groupToDelete && (
          <div>
            <p className="font-medium">{groupToDelete.name}</p>
            <p className="text-sm text-muted-foreground">
              {groupToDelete.description}
            </p>
            <p className="text-sm text-muted-foreground">
              Membres: {groupToDelete.memberCount}
            </p>
            <p className="text-sm font-medium text-amber-500 mt-2">
              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
              Les utilisateurs de ce groupe perdront les permissions associées.
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier un groupe
interface GroupFormProps {
  group: Group;
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
  onSave: (group: Group) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ group, permissions, permissionsByCategory, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Group>(group);
  const [activeTab, setActiveTab] = useState('details');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId]
        };
      } else {
        return {
          ...prev,
          permissions: prev.permissions.filter(id => id !== permissionId)
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nom</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="py-4">
          <div className="space-y-4">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                  {categoryPermissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id) || formData.permissions.includes('all')}
                        disabled={formData.permissions.includes('all')}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="all"
                  checked={formData.permissions.includes('all')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({...formData, permissions: ['all']});
                    } else {
                      setFormData({...formData, permissions: []});
                    }
                  }}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="all" className="text-sm font-medium">
                    Toutes les permissions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Accorde toutes les permissions, y compris les futures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-ivory-orange hover:bg-ivory-orange/90">
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  );
};

export default GroupsSettings;
