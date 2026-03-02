import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { calculateStats } from '@/lib/utils';
import { MatchCard } from '@/components/MatchCard';
import { WinRateRing } from '@/components/WinRateRing';
import { StatsCards } from '@/components/StatsCards';
import { Spinner } from '@/components/Spinner';
import { useMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';

export default function InicioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayMatches, matchesList, isLoading } = useMatches();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.email?.split('@')[0] ||
      'Jugador'
    : 'Jugador';

  const stats = calculateStats(matchesList);

  if (isLoading) return <Spinner />;

  return (
    <div className="flex-1 overflow-y-auto pb-32 px-4 pt-14">
      <h1 className="text-2xl font-bold text-foreground">
        Hola, {displayName}
      </h1>
      <p className="text-sm mt-0.5 mb-5 text-muted-foreground">
        Tu resumen de pádel
      </p>

      <div className="flex justify-center mb-5">
        <WinRateRing winRate={stats.winRate} />
      </div>

      <StatsCards stats={stats} />

      <div className="flex items-center justify-between mt-6 mb-3">
        <p className="text-base font-bold text-foreground">Partidos recientes</p>
        <Button
          variant="link"
          onClick={() => navigate('/partidos')}
          className="text-sm font-semibold text-primary p-0 h-auto"
        >
          Ver todos
        </Button>
      </div>

      {displayMatches.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-center text-muted-foreground">
            No hay partidos todavía. Añade uno desde el botón central.
          </p>
        </div>
      ) : (
        displayMatches.slice(0, 10).map((m) => <MatchCard key={m.id} match={m} />)
      )}
    </div>
  );
}
