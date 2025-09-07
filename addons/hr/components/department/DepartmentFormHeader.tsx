
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../src/components/ui/button';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

interface DepartmentFormHeaderProps {
  isEditMode: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
}

const DepartmentFormHeader: React.FC<DepartmentFormHeaderProps> = ({ isEditMode, onSubmit, onDelete }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Modifier un département' : 'Nouveau département'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode ? 'Modifier les informations du département' : 'Créer un nouveau département'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={() => navigate('/hr/departments')}
        >
          <ArrowLeft size={16} />
          Retour
        </Button>
        {isEditMode && (
          <Button variant="destructive" size="sm" className="flex items-center gap-2" onClick={onDelete}>
            <Trash2 size={16} />
            Supprimer
          </Button>
        )}
        <Button 
          size="sm" 
          className="flex items-center gap-2" 
          onClick={onSubmit}
        >
          <Save size={16} />
          Enregistrer
        </Button>
      </div>
    </div>
  );
};

export default DepartmentFormHeader;
