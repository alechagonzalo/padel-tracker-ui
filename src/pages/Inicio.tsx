import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { calculateStats } from '@/lib/utils';
import { MatchCard } from '@/components/MatchCard';
import { WinRateRing } from '@/components/WinRateRing';
import { StatsCards } from '@/components/StatsCards';
import { Spinner } from '@/components/Spinner';
import { useMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';

export default function InicioPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { displayMatches, matchesList, isLoading } = useMatches();

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      user.email?.split('@')[0] ||
      t('inicio.playerDefault')
    : t('inicio.playerDefault');

  const stats = calculateStats(matchesList);

  if (isLoading) return <Spinner />;

  return (
    <div className="flex-1 overflow-y-auto pb-32 md:pb-0 px-4 pt-14 md:pt-0">
      <h1 className="text-2xl font-bold text-foreground">
        {t('inicio.hello', { name: displayName })}
      </h1>
      <p className="text-sm mt-0.5 mb-5 text-muted-foreground">
        {t('inicio.summary')}
      </p>

      <div className="flex justify-center mb-5">
        <WinRateRing winRate={stats.winRate} />
      </div>

      <StatsCards stats={stats} />

      <div className="flex items-center justify-between mt-6 mb-3">
        <p className="text-base font-bold text-foreground">{t('inicio.recentMatches')}</p>
        <Button
          variant="link"
          onClick={() => navigate('/partidos')}
          className="text-sm font-semibold text-primary p-0 h-auto"
        >
          {t('inicio.viewAll')}
        </Button>
      </div>

      {displayMatches.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-center text-muted-foreground">
            {t('inicio.noMatches')}
          </p>
        </div>
      ) : (
        displayMatches.slice(0, 10).map((m) => <MatchCard key={m.id} match={m} />)
      )}
    </div>
  );
}
