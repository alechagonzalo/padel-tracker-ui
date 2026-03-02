import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchCard } from '@/components/MatchCard';
import { Spinner } from '@/components/Spinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ArrowLeft } from '@/components/icons';
import { matches as matchesApi } from '@/lib/api';
import { useMatches, revalidateMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';

export default function PartidosPage() {
  const navigate = useNavigate();
  const { displayMatches, isLoading } = useMatches();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await matchesApi.delete(deleteId);
    await revalidateMatches();
    setDeleteId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 bg-background">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 sticky top-0 z-10 bg-background">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft size={22} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Todos los partidos</h1>
      </div>

      <div className="px-4">
        {isLoading ? (
          <Spinner />
        ) : displayMatches.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <p className="text-base font-semibold text-foreground">No hay partidos todavía.</p>
            <p className="text-sm mt-2 text-muted-foreground">
              Añade uno desde el botón central del menú.
            </p>
          </div>
        ) : (
          displayMatches.map((m) => (
            <MatchCard key={m.id} match={m} onDelete={setDeleteId} />
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Eliminar partido"
        message="¿Seguro que quieres eliminar este partido?"
        confirmLabel="Eliminar"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
