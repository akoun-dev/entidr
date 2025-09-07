
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Building2, Users, Plus, FolderTree, Settings, ChevronRight, Search } from 'lucide-react';
import { HrLayout } from '../components';
import { Input } from '../../../../src/components/ui/input';

import { departmentService, employeeService } from '../../services';
import { Department, Employee } from '../../models/types';

/**
 * Page de liste des départements et hiérarchies
 */
const DepartmentsView: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [deps, emps] = await Promise.all([
          departmentService.getAll(),
          employeeService.getAllEmployees(),
        ]);
        setDepartments(deps);
        setEmployees(emps);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <HrLayout>
      <div>
        {/* En-tête avec fil d'Ariane */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mt-4">
            <div className="h-6 w-1.5 bg-amber-500 rounded-full"></div>
            <Building2 className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Départements et hiérarchies</h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
            <p className="text-muted-foreground">
              Organisation par départements et gestion des managers
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2 h-10">
                <FolderTree size={16} />
                Voir l'organigramme
              </Button>
              <Button className="flex items-center gap-2 bg-ivory-green hover:bg-ivory-green/90 h-10" asChild>
                <Link to="/hr/departments/new">
                  <Plus size={16} />
                  Nouveau département
                </Link>
              </Button>
            </div>
          </div>
        </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un département..."
          className="pl-10 h-11 bg-white/80 border-muted shadow-sm"
        />
      </div>

      {/* Liste des départements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {departments.map(dept => {
          const managerName = employees.find(e => e.id === (dept.manager_id as any))?.name || '—';
          const employeeCount = employees.filter(e => e.department_id === dept.id).length;
          return (
          <Card key={dept.id} className="bg-white/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/10">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold">{dept.name}</CardTitle>
                <Building2 className="h-5 w-5 text-ivory-orange" />
              </div>
              <CardDescription>
                Manager: {managerName}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{employeeCount} employés</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span>—</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-border/30">
              <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 hover:text-primary" asChild>
                <Link to={`/hr/departments/${dept.id}`}>
                  <span>Voir les détails</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );})}
      </div>

      {/* Fonctionnalités supplémentaires */}
      <Card className="mb-8 bg-white/80 backdrop-blur-sm border-ivory-orange/20 shadow-md">
        <CardHeader className="border-b border-border/30">
          <CardTitle className="text-xl">Fonctionnalités de gestion</CardTitle>
          <CardDescription>Outils pour gérer la structure organisationnelle</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          <Button variant="outline" className="justify-start h-auto py-4 px-4 border-border/40 hover:border-ivory-orange/50 hover:bg-muted/20">
            <div className="flex items-start gap-4">
              <div className="bg-ivory-orange/10 p-2 rounded-lg">
                <FolderTree className="h-6 w-6 text-ivory-orange" />
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-1">Organigramme</h3>
                <p className="text-sm text-muted-foreground">Visualisez la structure hiérarchique complète</p>
              </div>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 px-4 border-border/40 hover:border-ivory-orange/50 hover:bg-muted/20">
            <div className="flex items-start gap-4">
              <div className="bg-ivory-orange/10 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-ivory-orange" />
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-1">Gestion des rôles</h3>
                <p className="text-sm text-muted-foreground">Définissez les permissions par département</p>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
      </div>
    </HrLayout>
  );
};

export default DepartmentsView;
