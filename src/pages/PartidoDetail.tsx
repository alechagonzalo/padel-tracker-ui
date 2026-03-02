import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPlayerDisplayName } from '@/lib/utils';
import { Spinner } from '@/components/Spinner';
import { ArrowLeft, Calendar, MapPin } from '@/components/icons';
import { useMatch } from '@/hooks/useMatches';
import { useClubs } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const localeByLang: Record<string, string> = { es: 'es-ES', en: 'en-GB' };

export default function PartidoDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { match, isLoading } = useMatch(id);
  const { clubsList } = useClubs();
  const locale = localeByLang[i18n.language] ?? 'es-ES';

  if (isLoading) return <div className="pt-14 md:pt-0"><Spinner /></div>;

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
        <p className="text-base font-semibold text-foreground">{t('partidoDetail.notFound')}</p>
        <Button variant="link" onClick={() => navigate(-1)} className="mt-4 text-primary">
          {t('partidoDetail.back')}
        </Button>
      </div>
    );
  }

  const resolvedClub = clubsList.find((c) => c.id === match.clubId);
  const clubName = resolvedClub?.name ?? match.club?.name ?? match.clubId ?? t('partidoDetail.club');
  const score = match.score;
  const dateFormatted = new Date(match.date).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeFormatted = new Date(match.date).toLocaleTimeString(locale, {
    hour: '2-digit', minute: '2-digit',
  });
  const team1Names = match.team1Players?.map(getPlayerDisplayName).join(' / ') ?? '-';
  const team2Names = match.team2Players?.map(getPlayerDisplayName).join(' / ') ?? '-';

  return (
    <div className="min-h-screen pb-8 bg-background">
      <div className="flex items-center gap-3 px-4 pt-14 md:pt-0 pb-4 sticky top-0 z-10 bg-background">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft size={22} />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('partidoDetail.title')}</h1>
      </div>

      <div className="px-4 flex flex-col gap-5">
        {/* Resultado y tipo */}
        <div className="flex items-center gap-2.5">
          <Badge
            variant={match.result === 'won' ? 'default' : 'destructive'}
            className="px-4 py-2 text-base font-bold rounded-xl"
          >
            {match.result === 'won' ? t('partidoDetail.victory') : t('partidoDetail.defeat')}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1.5 text-sm rounded-xl">
            {match.type === 'tournament' ? t('partidoDetail.tournament') : t('partidoDetail.friendly')}
          </Badge>
        </div>

        {/* Fecha y lugar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5 text-muted-foreground">{t('partidoDetail.date')}</p>
                <p className="text-base font-semibold capitalize text-foreground">{dateFormatted}</p>
                <p className="text-sm mt-0.5 text-muted-foreground">{timeFormatted}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5 text-muted-foreground">{t('partidoDetail.place')}</p>
                <p className="text-base font-semibold text-foreground">{clubName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marcador */}
        {score && (
          <div>
            <p className="text-sm font-bold mb-3 text-foreground">{t('partidoDetail.score')}</p>
            <Card>
              <CardContent className="p-0">
                {[
                  { label: t('partidoDetail.set1'), s: score.set1 },
                  { label: t('partidoDetail.set2'), s: score.set2 },
                  ...(score.set3 ? [{ label: t('partidoDetail.set3'), s: score.set3 }] : []),
                ].map((row, i) => (
                  <div key={i}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <p className="text-sm font-semibold text-muted-foreground">{row.label}</p>
                      <p className="text-lg font-bold text-foreground">{row.s.team1} - {row.s.team2}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Equipos */}
        <div>
          <p className="text-sm font-bold mb-3 text-foreground">{t('partidoDetail.teams')}</p>
          <div className="flex gap-3">
            <Card className="flex-1">
              <CardContent className="p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5 text-muted-foreground">{t('partidoDetail.pair1')}</p>
                <p className="text-sm font-semibold leading-snug text-foreground">{team1Names}</p>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center w-7">
              <p className="text-sm font-bold text-muted-foreground">vs</p>
            </div>
            <Card className="flex-1">
              <CardContent className="p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5 text-muted-foreground">{t('partidoDetail.pair2')}</p>
                <p className="text-sm font-semibold leading-snug text-foreground">{team2Names}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
