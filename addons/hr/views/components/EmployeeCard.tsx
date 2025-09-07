
import React from 'react';
import { Link } from 'react-router-dom';
import { Employee } from '../../models';
import {
  Card,
  CardContent,
} from '../../../../src/components/ui/card';
import { Button } from '../../../../src/components/ui/button';
import {
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../../../src/components/ui/dropdown-menu';
import { Skeleton } from '../../../../src/components/ui/skeleton';

interface EmployeeCardProps {
  employee: Employee;
  onDelete?: (id: number) => void;
}

/**
 * Carte d'affichage d'un employé
 */
export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onDelete }) => {
  // Fonction pour générer des initiales à partir du nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(employee.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-ivory-orange">
      <div className="relative">
        <div className="aspect-[4/1] bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center adinkra-bg">
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-background/60 backdrop-blur-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/hr/employees/${employee.id}`}>Voir le profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/hr/employees/edit/${employee.id}`}>
                    <Edit className="h-4 w-4 mr-2" /> Modifier
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="absolute -bottom-12 left-6">
          {employee.image ? (
            <img
              src={employee.image}
              alt={employee.name}
              className="h-24 w-24 rounded-full border-4 border-background object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-ivory-green text-white flex items-center justify-center text-lg font-bold border-4 border-background">
              {getInitials(employee.name)}
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-14 pb-5">
        <div className="space-y-4">
          <div>
            <Link to={`/hr/employees/${employee.id}`} className="text-lg font-medium hover:text-primary">
              {employee.name}
            </Link>
            <p className="text-sm text-muted-foreground">{employee.job_title || "Poste non défini"}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2 text-ivory-green" />
              <span>{employee.department_name || "Sans département"}</span>
            </div>
            {employee.email && (
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 text-ivory-green" />
                <span className="truncate">{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 text-ivory-green" />
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.address && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 text-ivory-green" />
                <span className="truncate">{employee.address}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to={`/hr/employees/${employee.id}`}>Voir le profil</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 bg-ivory-orange/10 hover:bg-ivory-orange/20 border-ivory-orange/20">
              <Link to={`/hr/employees/edit/${employee.id}`}>Modifier</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EmployeeCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Skeleton className="aspect-[4/1]" />
        <div className="absolute -bottom-12 left-6">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
      </div>
      <CardContent className="pt-14 pb-5">
        <div className="space-y-4">
          <div>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
