import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import { Input } from '../../../../src/components/ui/input';
import { Textarea } from '../../../../src/components/ui/textarea';
import { documentService, employeeService } from '../../services';
import { Employee } from '../../models/types';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../src/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '../../../../src/components/ui/command';
import { HrLayout } from '../components';

const DocumentFormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    employee_id: '',
    type: '',
    file_url: '',
    mime_type: '',
    size_bytes: ''
  });
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empOpen, setEmpOpen] = useState(false);
  const selectedEmployee = employees.find(e => String(e.id) === form.employee_id);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      try {
        const d = await documentService.getById(id);
        setForm({
          name: d.name || '',
          employee_id: d.employee_id != null ? String(d.employee_id) : '',
          type: d.type || '',
          file_url: d.file_url || '',
          mime_type: d.mime_type || '',
          size_bytes: d.size_bytes != null ? String(d.size_bytes) : ''
        });
      } catch (e) { console.error('Load document failed', e); }
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
        employee_id: form.employee_id ? Number(form.employee_id) : undefined,
        type: form.type || undefined,
        file_url: form.file_url,
        mime_type: form.mime_type || undefined,
        size_bytes: form.size_bytes ? Number(form.size_bytes) : undefined,
      };
      if (isEdit && id) await documentService.update(id, payload);
      else await documentService.create(payload);
      navigate('/hr/documents');
    } catch (e) {
      console.error('Save document failed', e);
      alert('Enregistrement impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HrLayout>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Modifier un document' : 'Nouveau document'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Nom</label>
              <Input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Employé (optionnel)</label>
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
              <Input name="type" value={form.type} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">URL du fichier</label>
              <Input name="file_url" value={form.file_url} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">MIME</label>
              <Input name="mime_type" value={form.mime_type} onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm">Taille (bytes)</label>
              <Input name="size_bytes" value={form.size_bytes} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/hr/documents')}>Annuler</Button>
            <Button onClick={save} disabled={loading}>{isEdit ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </CardContent>
      </Card>
    </HrLayout>
  );
};

export default DocumentFormView;
