import React, { useEffect, useState } from 'react';
import { HrLayout } from '../components';
import { securityService } from '../../services';
import type { HrRole, HrPermission } from '../../services/security.service';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../src/components/ui/card';
import { Switch } from '../../../../src/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../src/components/ui/tabs';
import { Badge } from '../../../../src/components/ui/badge';
import { Shield, Users, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SecurityView: React.FC = () => {
  const [roles, setRoles] = useState<HrRole[]>([]);
  const [permissions, setPermissions] = useState<HrPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRole, setSearchRole] = useState('');
  const [searchPermission, setSearchPermission] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        securityService.listRoles(),
        securityService.listPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredRoles = roles.filter(r =>
    !searchRole ||
    r.name.toLowerCase().includes(searchRole.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchRole.toLowerCase()))
  );

  const filteredPermissions = permissions.filter(p =>
    !searchPermission ||
    p.name.toLowerCase().includes(searchPermission.toLowerCase()) ||
    p.resource.toLowerCase().includes(searchPermission.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchPermission.toLowerCase()))
  );

  const toggleRoleStatus = async (roleId: number | string, active: boolean) => {
    const updated = await securityService.updateRole(roleId, { active });
    setRoles(prev => prev.map(x => x.id === roleId ? updated : x));
  };

  const deleteRole = async (roleId: number | string) => {
    await securityService.deleteRole(roleId);
    setRoles(prev => prev.filter(x => x.id !== roleId));
  };

  const deletePermission = async (permissionId: number | string) => {
    await securityService.deletePermission(permissionId);
    setPermissions(prev => prev.filter(x => x.id !== permissionId));
  };

  return (
    <HrLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-1.5 bg-blue-500 rounded-full"></div>
          <Shield className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Sécurité & Rôles</h1>
        </div>
        <p className="text-muted-foreground">
          Gestion des rôles et permissions pour le module RH
        </p>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Rôles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rôles */}
          <TabsContent value="roles" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Gestion des rôles</h2>
                <p className="text-sm text-muted-foreground">Créer et gérer les rôles utilisateurs</p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher un rôle..."
                  value={searchRole}
                  onChange={e => setSearchRole(e.target.value)}
                  className="w-64"
                />
                <Button onClick={() => navigate('/hr/security/roles/new')}>Nouveau rôle</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Liste des rôles</CardTitle>
                <CardDescription>Rôles disponibles dans le système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRoles.map(role => (
                    <div key={role.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                        <div className="flex gap-1 mt-1">
                          {role.permissions.slice(0, 3).map((permission, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} autres
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={role.active}
                          onCheckedChange={(val) => toggleRoleStatus(role.id, val)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/hr/security/roles/edit/${role.id}`)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRole(role.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredRoles.length === 0 && (
                    <div className="text-sm text-muted-foreground">Aucun rôle trouvé</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Permissions */}
          <TabsContent value="permissions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Gestion des permissions</h2>
                <p className="text-sm text-muted-foreground">Créer et gérer les permissions système</p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher une permission..."
                  value={searchPermission}
                  onChange={e => setSearchPermission(e.target.value)}
                  className="w-64"
                />
                <Button onClick={() => navigate('/hr/security/permissions/new')}>Nouvelle permission</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Liste des permissions</CardTitle>
                <CardDescription>Permissions disponibles dans le système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredPermissions.map(permission => (
                    <div key={permission.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {permission.resource}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {permission.action}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/hr/security/permissions/edit/${permission.id}`)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePermission(permission.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredPermissions.length === 0 && (
                    <div className="text-sm text-muted-foreground">Aucune permission trouvée</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HrLayout>
  );
};

export default SecurityView;
