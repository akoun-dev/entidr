
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../src/components/ui/tabs';
import { HrDashboardStats } from '../../models/types';
import { employeeService, departmentService } from '../../services';
import {
  Users,
  Building2,
  CalendarCheck,
  LineChart,
  BarChart3,
  ArrowUpRight,
  Download,
  Plus,
  Clock,
  Bell,
  Filter,
  ChevronRight,
  GraduationCap,  // Added missing import for GraduationCap
  Briefcase,      // Added missing import for Briefcase
  LayoutDashboard // Added missing import for LayoutDashboard
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../../../../src/components/ui/avatar';
import { Badge } from '../../../../src/components/ui/badge';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { HrLayout } from '../components';

/**
 * Dashboard renouvélé pour le module RH
 */
const HrDashboardView: React.FC = () => {
  const [stats, setStats] = useState<HrDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Sections de démo retirées: utiliser uniquement les stats calculées à partir des données réelles
  // Placeholders vides pour éviter toute référence non définie dans le rendu
  const recentActivities: any[] = [];
  const upcomingEvents: any[] = [];

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        // Dans une implémentation réelle, cela viendrait d'un service
        const employees = await employeeService.getAllEmployees();
        const departments = await departmentService.getAll();
        const leaves: any[] = []; // non implémenté pour l'instant

        // Calculer les statistiques
        const departmentCounts: Record<string, number> = {};
        employees.forEach(emp => {
          if (emp.department_name) {
            departmentCounts[emp.department_name] = (departmentCounts[emp.department_name] || 0) + 1;
          }
        });

        const employeesByDepartment = Object.entries(departmentCounts).map(([departmentName, count]) => ({
          departmentName,
          count
        }));

        setStats({
          totalEmployees: employees.length,
          totalDepartments: departments.length,
          activeLeaves: leaves.filter(l => l.state === 'approved').length,
          upcomingLeaves: leaves.filter(l => new Date(l.date_from) > new Date()).length,
          employeesByDepartment
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Formater une date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fonction pour calculer l'intervalle de temps relatif
  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `il y a ${diffInSeconds} seconde${diffInSeconds !== 1 ? 's' : ''}`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours !== 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `il y a ${diffInDays} jour${diffInDays !== 1 ? 's' : ''}`;
    }

    return `le ${new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date)}`;
  };

  return (
    <HrLayout>
      <div className="space-y-6">
        {/* En-tête avec fil d'Ariane */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 bg-amber-500 rounded-full"></div>
            <LayoutDashboard className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Tableau de Bord RH</h1>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-4">
            <p className="text-muted-foreground">
              Supervision et analyse des ressources humaines
            </p>
            <div className="flex items-center gap-3 self-end">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download size={16} />
                Exporter
              </Button>
              <Button size="sm" className="flex items-center gap-2 bg-ivory-orange hover:bg-ivory-orange/90">
                <Plus size={16} />
                Nouvel employé
              </Button>
            </div>
          </div>
        </div>

        {/* Onglets du tableau de bord */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border/30 p-1 h-auto w-full md:w-fit">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-ivory-orange data-[state=active]:text-white h-9"
            >
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-ivory-orange data-[state=active]:text-white h-9"
            >
              Analytiques
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-ivory-orange data-[state=active]:text-white h-9"
            >
              Rapports
            </TabsTrigger>
          </TabsList>

        {/* Contenu de l'onglet Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted-foreground/10 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted-foreground/20 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="transform transition-transform duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">Employés</CardTitle>
                    <div className="p-2 rounded-lg bg-blue-100/40 dark:bg-blue-900/20">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <CardDescription>Effectif total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stats.totalEmployees}</span>
                    <span className="text-sm text-muted-foreground">personnes</span>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-green-500 font-medium ml-1">+3%</span>
                    <span className="text-muted-foreground ml-2">depuis le mois dernier</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="transform transition-transform duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">Départements</CardTitle>
                    <div className="p-2 rounded-lg bg-purple-100/40 dark:bg-purple-900/20">
                      <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <CardDescription>Structuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stats.totalDepartments}</span>
                    <span className="text-sm text-muted-foreground">unités</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Taux de couverture</div>
                      <div className="h-2 w-36 bg-muted rounded-full">
                        <div className="h-2 bg-purple-600 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="transform transition-transform duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">Congés actifs</CardTitle>
                    <div className="p-2 rounded-lg bg-amber-100/40 dark:bg-amber-900/20">
                      <CalendarCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <CardDescription>En cours actuellement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stats.activeLeaves}</span>
                    <span className="text-sm text-muted-foreground">congés</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Congés programmés</span>
                      <span>{stats.upcomingLeaves}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full">
                      <div
                        className="h-2 bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(stats.upcomingLeaves / stats.totalEmployees * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transform transition-transform duration-200 hover:scale-[1.02]">
                <CardHeader className="pb-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">Performance</CardTitle>
                    <div className="p-2 rounded-lg bg-green-100/40 dark:bg-green-900/20">
                      <LineChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <CardDescription>Indice de performance RH</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">94%</span>
                    <span className="text-sm text-muted-foreground">efficacité</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Objectif: 95%</div>
                      <div className="h-2 w-36 bg-muted rounded-full">
                        <div className="h-2 bg-green-600 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-500">+2.1%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">Aucune donnée disponible</p>
            </div>
          )}

          {/* Widgets inférieurs */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Répartition des employés - occupe 4/7 de l'espace */}
            <Card className="lg:col-span-4 overflow-hidden">
              <CardHeader className="pb-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Répartition des employés</CardTitle>
                    <CardDescription>Employés par département</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      Filtres
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                {stats && (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={stats.employeesByDepartment}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <XAxis
                        dataKey="departmentName"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} employés`, '']}
                        labelFormatter={(label) => `Département: ${label}`}
                      />
                      <Bar dataKey="count" fill="#FF6600" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Activités récentes - occupe 3/7 de l'espace */}
            <Card className="lg:col-span-3 h-[450px] overflow-hidden flex flex-col">
              <CardHeader className="pb-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Activités récentes</CardTitle>
                    <CardDescription>Dernières actions RH</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <Clock className="h-3 w-3 mr-1" />
                    Historique
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <Avatar className="h-9 w-9 mr-3">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {activity.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.userName}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>{" "}
                          <span className="font-medium text-primary">{activity.subject}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques RH</CardTitle>
              <CardDescription>Données analytiques complètes pour le département RH</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                Module d'analytiques en cours de développement
                <br />
                <span className="text-sm">Disponible prochainement</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Rapports RH</CardTitle>
              <CardDescription>Générateur de rapports personnalisés</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                Module de rapports en cours de développement
                <br />
                <span className="text-sm">Disponible prochainement</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </HrLayout>
  );
};

export default HrDashboardView;
