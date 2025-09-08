import React, { useEffect, useState } from 'react';
import { HrLayout } from '../components';
import { taskService, employeeService } from '../../services';
import type { HrTask } from '../../services/task.service';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../src/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../../../../src/components/ui/command';
import type { Employee } from '../../models/types';
import { UserX } from 'lucide-react';

const OffboardingView: React.FC = () => {
  const [tasks, setTasks] = useState<HrTask[]>([]);
  const [title, setTitle] = useState('Restituer le matériel');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empOpen, setEmpOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');

  const load = async (empId?: string) => {
    setLoading(true);
    try { setTasks(await taskService.list('offboarding', empId ? Number(empId) : undefined)); } finally { setLoading(false); }
  };

  useEffect(() => { load(employeeId); }, [employeeId]);
  useEffect(() => { (async () => { try { setEmployees(await employeeService.getAllEmployees()); } catch {} })(); }, []);

  return (
    <HrLayout>
      <div>
        {/* En-tête avec actions */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mt-4">
            <div className="h-6 w-1.5 bg-amber-500 rounded-full"></div>
            <UserX className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Offboarding</h1>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
            <p className="text-muted-foreground">
              Procédure de sortie (restitution matériel, documents de fin de contrat)
            </p>
            <Popover open={empOpen} onOpenChange={setEmpOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9">
                  {employeeId ? `Employé #${employeeId}` : 'Filtrer par employé'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[320px]">
                <Command>
                  <CommandInput placeholder="Rechercher un employé..." />
                  <CommandList>
                    <CommandEmpty>Aucun résultat</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all" onSelect={() => { setEmployeeId(''); setEmpOpen(false); }}>Tous</CommandItem>
                      {employees.map(e => (
                        <CommandItem key={e.id} value={`${e.id} ${e.name}`} onSelect={() => { setEmployeeId(String(e.id)); setEmpOpen(false); }}>
                          {e.name} <span className="ml-auto text-xs text-muted-foreground">#{e.id}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nouvelle tâche" value={title} onChange={e => setTitle(e.target.value)} className="w-64" />
            <Button onClick={async () => {
              if (!title.trim()) return;
              const created = await taskService.create({ kind: 'offboarding', title, employee_id: employeeId ? Number(employeeId) : undefined });
              setTasks(prev => [created as any, ...prev]);
              setTitle('');
            }}>Ajouter</Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Procédure de sortie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.status}</div>
                  </div>
                  <div className="flex gap-2">
                    {t.status !== 'done' && (
                      <Button size="sm" variant="outline" onClick={async () => {
                        const updated = await taskService.update(t.id, { status: 'done' });
                        setTasks(prev => prev.map(x => x.id === t.id ? updated : x));
                      }}>Marquer fait</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={async () => { await taskService.remove(t.id); setTasks(prev => prev.filter(x => x.id !== t.id)); }}>Supprimer</Button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <div className="text-sm text-muted-foreground">Aucune tâche.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </HrLayout>
  );
};

export default OffboardingView;
