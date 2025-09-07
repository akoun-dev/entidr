import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Textarea } from '../../../../src/components/ui/textarea';
import { contractService, employeeService } from '../../services';
import { Employee } from '../../models/types';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../src/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../../../../src/components/ui/command';
import { HrLayout } from '../components';

const ContractFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    employee_id: '',
    contract_type: 'CDI',
    date_start: new Date().toISOString().slice(0,10),
    date_end: '',
    wage: '',
    state: 'running',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empOpen, setEmpOpen] = useState(false);
  const selectedEmployee = employees.find(e => String(e.id) === form.employee_id);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      try {
        const c = await contractService.getById(id);
        setForm({
          name: c.name || '',
          employee_id: String(c.employee_id || ''),
          contract_type: c.contract_type || 'CDI',
          date_start: c.date_start || new Date().toISOString().slice(0,10),
          date_end: c.date_end || '',
          wage: c.wage != null ? String(c.wage) : '',
          state: c.state || 'running',
          notes: c.notes || ''
        });
      } catch (e) { console.error('Load contract failed', e); }
    };
    load();
  }, [id, isEdit]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try { setEmployees(await employeeService.getAllEmployees()); } catch (e) { console.error(e); }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setLoading(true);
    try {
      const payload: any = {
        name: form.name,
        employee_id: Number(form.employee_id),
        contract_type: form.contract_type,
        date_start: form.date_start,
        date_end: form.date_end || null,
        wage: form.wage ? Number(form.wage) : null,
        state: form.state,
        notes: form.notes || null,
      };
      if (isEdit && id) await contractService.update(id, payload);
      else await contractService.create(payload);
      navigate('/hr/contracts');
    } catch (e) {
      console.error('Save contract failed', e);
      alert('Enregistrement impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HrLayout>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Modifier un contrat' : 'Nouveau contrat'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nom</label>
              <Input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Employé</label>
              <Popover open={empOpen} onOpenChange={setEmpOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedEmployee ? `${selectedEmployee.name} (#${selectedEmployee.id})` : 'Sélectionner un employé'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[320px]">
                  <Command>
                    <CommandInput placeholder="Rechercher un employé..." />
                    <CommandList>
                      <CommandEmpty>Aucun résultat</CommandEmpty>
                      <CommandGroup>
                        {employees.map(e => (
                          <CommandItem key={e.id} value={`${e.id} ${e.name}`} onSelect={() => {
                            setForm(prev => ({ ...prev, employee_id: String(e.id) }));
                            setEmpOpen(false);
                          }}>
                            {e.name} <span className="ml-auto text-xs text-muted-foreground">#{e.id}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm">Type</label>
              <Input name="contract_type" value={form.contract_type} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Début</label>
              <Input type="date" name="date_start" value={form.date_start} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Fin</label>
              <Input type="date" name="date_end" value={form.date_end} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Salaire</label>
              <Input name="wage" value={form.wage} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Statut</label>
              <Input name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Notes</label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/hr/contracts')}>Annuler</Button>
            <Button onClick={save} disabled={loading}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </CardContent>
      </Card>
    </HrLayout>
  );
};

export default ContractFormView;
