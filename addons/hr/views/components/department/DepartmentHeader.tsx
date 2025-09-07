
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../../src/components/ui/button';
import { ArrowLeft, Edit, Trash2, Building2 } from 'lucide-react';
import { Badge } from '../../../../../src/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../src/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

interface Manager {
  id: string;
  name: string;
  job_title: string;
  avatar_url: string;
}

interface Parent {
  id: string;
  name: string;
}

interface DepartmentHeaderProps {
  id: string;
  department: {
    id: string;
    name: string;
    code: string;
    manager: Manager;
    parent: Parent;
    description: string;
    is_active: boolean;
    employee_count: number;
  };
  getInitials: (name: string) => string;
  onDelete?: (id: string) => void;
}

const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({ id, department, getInitials, onDelete }) => {
  const navigate = useNavigate();
  
  return (
    <>
      {/* En-tête avec actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Département</h1>
          <p className="text-muted-foreground mt-1">Détails et informations du département</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate('/hr/departments')}>
            <ArrowLeft size={16} />
            Retour
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigate(`/hr/departments/edit/${id}`)}>
            <Edit size={16} />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => onDelete && onDelete(id)}
          >
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>
      </div>
      
      {/* En-tête du département */}
      <div className="flex flex-col md:flex-row gap-6 items-start mt-8 mb-6">
        <div className="flex items-center justify-center h-24 w-24 rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-12 w-12" />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <h2 className="text-2xl font-bold">{department.name}</h2>
            <Badge variant={department.is_active ? "default" : "secondary"}>
              {department.is_active ? 'Actif' : 'Inactif'}
            </Badge>
            <Badge variant="outline">{department.code}</Badge>
          </div>
          
          <div className="text-lg text-muted-foreground mt-1">
            {department.parent.name && (
              <span>Département de {department.parent.name}</span>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {department.manager.avatar_url ? (
                  <AvatarImage src={department.manager.avatar_url} alt={department.manager.name} />
                ) : (
                  <AvatarFallback>{getInitials(department.manager.name)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="text-sm font-medium">Responsable</div>
                <Link to={`/hr/employees/${department.manager.id}`} className="text-primary hover:underline">
                  {department.manager.name}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Employés</div>
                <div>{department.employee_count} employés</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepartmentHeader;
