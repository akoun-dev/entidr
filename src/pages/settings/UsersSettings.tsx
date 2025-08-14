import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Users, Search, Plus, Pencil, Trash2, UserPlus, Mail, Lock, Shield, Loader2, UserX } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { userService, groupService, User as ApiUser } from '../../services';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { useGroups } from '../../hooks/useReferenceData';

// Types pour les utilisateurs
interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  lastLogin?: string;
  groups: string[];
  password?: string; // Uniquement pour la création/modification
}

/**
 * Page des paramètres des utilisateurs
 * Permet de gérer les utilisateurs de l'application
 */
const UsersSettings: React.FC = () => {
  // État pour les utilisateurs
  const [users, setUsers] = useState<User[]>([]);

  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État pour les groupes disponibles
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  // Toast pour les notifications
  const { toast } = useToast();

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');

  // État pour l'utilisateur en cours d'édition
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // États pour la confirmation de suppression
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Charger les utilisateurs et les groupes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les utilisateurs
        const usersData = await userService.getAll();

        // Transformer les données pour correspondre à notre interface
        const transformedUsers = usersData.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          lastLogin: user.lastLogin,
          groups: user.groups
        }));

        setUsers(transformedUsers);

        // Charger les groupes
        const groupsData = await groupService.getAll();
        setAvailableGroups(groupsData.map(group => group.name));

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données des utilisateurs',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter(user =>
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer l'ajout ou la modification d'un utilisateur
  const handleSaveUser = async (user: User) => {
    setSaving(true);

    try {
      if (editingUser) {
        // Mise à jour d'un utilisateur existant
        const { password, ...userData } = user;
        const updatedUser = await userService.update(user.id, password ? user : userData);

        // Mettre à jour la liste des utilisateurs
        setUsers(users.map(u => u.id === updatedUser.id ? {
          ...updatedUser,
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || ''
        } : u));

        toast({
          title: 'Succès',
          description: 'L\'utilisateur a été mis à jour',
          variant: 'default'
        });
      } else {
        // Ajout d'un nouvel utilisateur
        if (!user.password) {
          toast({
            title: 'Erreur',
            description: 'Le mot de passe est requis pour créer un utilisateur',
            variant: 'destructive'
          });
          setSaving(false);
          return;
        }

        const newUser = await userService.create(user);

        // Ajouter le nouvel utilisateur à la liste
        setUsers([...users, {
          ...newUser,
          firstName: newUser.firstName || '',
          lastName: newUser.lastName || ''
        }]);

        toast({
          title: 'Succès',
          description: 'L\'utilisateur a été créé',
          variant: 'default'
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'utilisateur',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      await userService.delete(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));

      toast({
        title: 'Succès',
        description: 'L\'utilisateur a été supprimé',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'utilisateur',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer l'activation/désactivation d'un utilisateur
  const handleToggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';

    try {
      await userService.toggleStatus(id, newStatus);

      setUsers(users.map(u =>
        u.id === id
          ? { ...u, status: newStatus }
          : u
      ));

      toast({
        title: 'Succès',
        description: `L'utilisateur a été ${newStatus === 'active' ? 'activé' : 'désactivé'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le statut de l\'utilisateur',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les utilisateurs de votre application</p>
        </div>
      </div>

      {/* Carte principale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>Gérez les comptes utilisateurs et leurs permissions</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-ivory-orange hover:bg-ivory-orange/90"
                onClick={() => setEditingUser(null)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? 'Modifiez les informations de l\'utilisateur'
                    : 'Remplissez les informations pour ajouter un nouvel utilisateur'}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                user={editingUser || {
                  id: '',
                  username: '',
                  email: '',
                  role: 'user',
                  status: 'active',
                  groups: []
                }}
                onSave={handleSaveUser}
                onCancel={() => setIsDialogOpen(false)}
                saving={saving}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tableau des utilisateurs */}
          <div className="rounded-md border">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Groupes</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Gestionnaire' : 'Utilisateur'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.groups.map((group, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{user.lastLogin || 'Jamais connecté'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.status === 'active'}
                              onCheckedChange={() => handleToggleUserStatus(user.id)}
                            />
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingUser(user);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(user)}
                              disabled={user.role === 'admin'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        {searchTerm ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur disponible'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Supprimer l'utilisateur"
        description="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        actionLabel="Supprimer"
        variant="destructive"
        isProcessing={isDeleting}
        icon={<UserX className="h-4 w-4 mr-2" />}
        onConfirm={handleDeleteUser}
      >
        {userToDelete && (
          <div>
            <p className="font-medium">{userToDelete.username}</p>
            <p className="text-sm text-muted-foreground">
              {userToDelete.firstName} {userToDelete.lastName} ({userToDelete.email})
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Rôle: {userToDelete.role === 'admin' ? 'Administrateur' : userToDelete.role === 'manager' ? 'Gestionnaire' : 'Utilisateur'}
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

// Composant de formulaire pour ajouter/modifier un utilisateur
interface UserFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
  saving: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState<User>(user);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(user.groups || []);

  // Utiliser le hook useGroups pour récupérer les groupes
  const { data: availableGroups, loading: loadingGroups } = useGroups();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as 'admin' | 'manager' | 'user'
    });
  };

  const handleGroupToggle = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      groups: selectedGroups
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">Nom d'utilisateur</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="firstName" className="text-right">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="lastName" className="text-right">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="col-span-3"
            required
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            {user.id ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password || ''}
            onChange={handleChange}
            className="col-span-3"
            required={!user.id}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Rôle</Label>
          <Select
            value={formData.role}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Sélectionnez un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="manager">Gestionnaire</SelectItem>
              <SelectItem value="user">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-start gap-4 pt-2">
          <Label className="text-right pt-2">Groupes</Label>
          <div className="col-span-3 border rounded-md p-3 space-y-2">
            {loadingGroups ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des groupes...</span>
              </div>
            ) : availableGroups && availableGroups.length > 0 ? (
              availableGroups.map(group => (
                <div key={group.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.name}`}
                    checked={selectedGroups.includes(group.name)}
                    onCheckedChange={() => handleGroupToggle(group.name)}
                  />
                  <Label htmlFor={`group-${group.name}`} className="cursor-pointer">
                    {group.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucun groupe disponible</p>
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button
          type="submit"
          className="bg-ivory-orange hover:bg-ivory-orange/90"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default UsersSettings;
