import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className={className}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Retour
    </Button>
  );
};