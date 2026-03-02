import { useNavigate } from 'react-router-dom';
import { AddMatchForm } from '@/components/AddMatchForm';

export default function AddMatchPage() {
  const navigate = useNavigate();

  return (
    <AddMatchForm
      onSuccess={() => navigate('/inicio', { replace: true })}
    />
  );
}
