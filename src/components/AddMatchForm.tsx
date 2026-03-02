import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { getPlayerDisplayName } from '@/lib/utils';
import { Calendar as CalendarIcon, ChevronDown, CheckCircle } from '@/components/icons';
import { matches as matchesApi } from '@/lib/api';
import { appTypeToApiType, appResultToApiOutcome, scoreToResultString } from '@/lib/apiMappers';
import { useAuth } from '@/context/AuthContext';
import { usePlayers } from '@/hooks/usePlayers';
import { useClubs } from '@/hooks/useClubs';
import { revalidateMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MatchType } from '@/types';

type AddMatchFormProps = {
  onSuccess?: () => void;
  /** Si es true, no muestra el título de página (para uso en modal) */
  compact?: boolean;
};

type CourtSide = 'derecha' | 'reves';
const oppositeSide = (s: CourtSide): CourtSide => (s === 'derecha' ? 'reves' : 'derecha');

export function AddMatchForm({ onSuccess, compact = false }: AddMatchFormProps) {
  const { user } = useAuth();
  const { playersList } = usePlayers();
  const { clubsList } = useClubs();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState('18:00');
  const [clubId, setClubId] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [partnerPosition, setPartnerPosition] = useState<CourtSide | ''>('');
  const [opponent1Id, setOpponent1Id] = useState('');
  const [opponent1Position, setOpponent1Position] = useState<CourtSide | ''>('');
  const [opponent2Id, setOpponent2Id] = useState('');
  const [category, setCategory] = useState<MatchType>('friendly');
  const [tournamentName, setTournamentName] = useState('');
  const [set1My, setSet1My] = useState('');
  const [set1Opp, setSet1Opp] = useState('');
  const [set2My, setSet2My] = useState('');
  const [set2Opp, setSet2Opp] = useState('');
  const [set3My, setSet3My] = useState('');
  const [set3Opp, setSet3Opp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const s1My = parseInt(set1My) || 0;
  const s1Opp = parseInt(set1Opp) || 0;
  const s2My = parseInt(set2My) || 0;
  const s2Opp = parseInt(set2Opp) || 0;
  const s3My = parseInt(set3My) || 0;
  const s3Opp = parseInt(set3Opp) || 0;
  const mySetWins = (s1My > s1Opp ? 1 : 0) + (s2My > s2Opp ? 1 : 0) + (s3My > s3Opp ? 1 : 0);
  const oppSetWins = (s1Opp > s1My ? 1 : 0) + (s2Opp > s2My ? 1 : 0) + (s3Opp > s3My ? 1 : 0);
  const needsThirdSet = mySetWins === 1 && oppSetWins === 1;

  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'en' ? enUS : es;

  /** Validación según reglas del pádel: al mejor de 3 sets, cada set con ganador, si 1-1 obligatorio set 3 */
  function getScoreError(): string | null {
    const set1Tied = s1My === s1Opp && (s1My > 0 || s1Opp > 0);
    const set2Tied = s2My === s2Opp && (s2My > 0 || s2Opp > 0);
    if (set1Tied || set2Tied) return t('addMatch.errorSetTie');
    const set1Filled = s1My > 0 || s1Opp > 0;
    const set2Filled = s2My > 0 || s2Opp > 0;
    if (!set1Filled || !set2Filled) return t('addMatch.errorSet1Set2');
    if (needsThirdSet) {
      const set3Filled = s3My > 0 || s3Opp > 0;
      if (!set3Filled) return t('addMatch.errorSet3Required');
      if (s3My === s3Opp) return t('addMatch.errorSet3Tie');
    }
    const totalMy = mySetWins;
    const totalOpp = oppSetWins;
    if (totalMy !== 2 && totalOpp !== 2) return t('addMatch.errorMustHaveWinner');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !opponent1Id || !opponent2Id || !clubId) {
      setError(t('addMatch.errorRequired'));
      return;
    }
    const scoreError = getScoreError();
    if (scoreError) {
      setError(scoreError);
      return;
    }
    const score = {
      set1: { team1: s1My, team2: s1Opp },
      set2: { team1: s2My, team2: s2Opp },
      ...(s3My || s3Opp ? { set3: { team1: s3My, team2: s3Opp } } : {}),
    };
    const outcome = mySetWins > oppSetWins ? 'won' : 'lost';
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dateIso = new Date(`${dateStr}T${time}:00`).toISOString();
    setSubmitting(true);
    setError('');
    try {
      await matchesApi.create({
        result: scoreToResultString(score),
        club: clubId,
        date: dateIso,
        outcome: appResultToApiOutcome(outcome),
        type: appTypeToApiType(category),
        playerIds: [partnerId, opponent1Id, opponent2Id],
      });
      await revalidateMatches();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('addMatch.errorSaveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const partnerOptions = playersList.filter((p) => p.id !== opponent1Id && p.id !== opponent2Id);
  const opponent1Options = playersList.filter((p) => p.id !== partnerId && p.id !== opponent2Id);
  const opponent2Options = playersList.filter((p) => p.id !== partnerId && p.id !== opponent1Id);

  return (
    <div className={compact ? '' : 'flex-1 overflow-y-auto pb-32 md:pb-0 pt-14 md:pt-0 px-4 bg-background'}>
      {!compact && (
        <>
          <h1 className="text-2xl font-bold text-foreground">{t('addMatch.title')}</h1>
          <p className="text-sm mt-0.5 mb-5 text-muted-foreground">{t('addMatch.subtitle')}</p>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <section className="flex flex-col gap-3.5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarIcon size={18} className="text-primary" />
            {t('addMatch.whenAndWhere')}
          </h2>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.dateTime')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-2 bg-input border-border font-normal text-left"
                  >
                    <CalendarIcon size={18} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground">
                      {format(selectedDate, i18n.language === 'en' ? 'MMM d, yyyy' : "d 'de' MMM yyyy", { locale: dateLocale })}, {time}
                    </span>
                    <ChevronDown size={18} className="ml-auto text-muted-foreground shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && setSelectedDate(d)}
                    defaultMonth={selectedDate}
                    className="rounded-lg border-0"
                    locale={dateLocale}
                  />
                  <div className="border-t p-3 space-y-2">
                    <Label htmlFor="match-time" className="text-[11px] uppercase tracking-wide">
                      {t('addMatch.startTime')}
                    </Label>
                    <Input
                      id="match-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="[&::-webkit-calendar-picker-indicator]:opacity-50"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.club')}</Label>
              <Select value={clubId || undefined} onValueChange={setClubId}>
                <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                  <SelectValue placeholder={t('addMatch.selectClub')} />
                </SelectTrigger>
                <SelectContent>
                  {clubsList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.type ? ` · ${t(`clubes.${c.type}`)}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.type')}</Label>
              <div className="flex rounded-lg p-0.5 bg-muted">
                {(['friendly', 'tournament'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="ghost"
                    onClick={() => setCategory(type)}
                    className={`flex-1 rounded-md text-sm font-semibold transition-all h-10 ${
                      category === type
                        ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                        : 'text-muted-foreground hover:bg-transparent hover:text-muted-foreground'
                    }`}
                  >
                    {type === 'friendly' ? t('addMatch.friendly') : t('addMatch.tournament')}
                  </Button>
                ))}
              </div>
            </div>

            {category === 'tournament' && (
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.tournamentName')}</Label>
                <Input
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder={t('addMatch.tournamentNamePlaceholder')}
                />
              </div>
            )}
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-base font-semibold text-foreground">{t('addMatch.players')}</h2>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide -mb-1">{t('addMatch.yourTeam')}</p>
          <div className="grid grid-cols-[1fr_1fr] gap-x-3 gap-y-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.you')}</Label>
              <Input
                disabled
                value={user ? getPlayerDisplayName(user) : ''}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.side')}</Label>
              <Input
                disabled
                value={partnerPosition ? t(`addMatch.${oppositeSide(partnerPosition)}`) : '—'}
                className="bg-muted/50 border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.partner')}</Label>
              <Select value={partnerId || undefined} onValueChange={setPartnerId}>
                <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                  <SelectValue placeholder={t('addMatch.selectPartner')} />
                </SelectTrigger>
                <SelectContent>
                  {partnerOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {getPlayerDisplayName(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.side')}</Label>
              <Select
                value={partnerPosition || undefined}
                onValueChange={(v) => setPartnerPosition(v as CourtSide)}
              >
                <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                  <SelectValue placeholder={t('addMatch.side')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="derecha">{t('addMatch.derecha')}</SelectItem>
                  <SelectItem value="reves">{t('addMatch.reves')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-1">
            <p className="text-[11px] font-bold uppercase tracking-wide mb-2 text-destructive">{t('addMatch.opponents')}</p>
            <div className="grid grid-cols-[1fr_1fr] gap-x-3 gap-y-3 items-end">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.opponent1')}</Label>
                <Select value={opponent1Id || undefined} onValueChange={setOpponent1Id}>
                  <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                    <SelectValue placeholder={t('addMatch.selectOpponent1')} />
                  </SelectTrigger>
                  <SelectContent>
                    {opponent1Options.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {getPlayerDisplayName(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.side')}</Label>
                <Select
                  value={opponent1Position || undefined}
                  onValueChange={(v) => setOpponent1Position(v as CourtSide)}
                >
                  <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                    <SelectValue placeholder={t('addMatch.side')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="derecha">{t('addMatch.derecha')}</SelectItem>
                    <SelectItem value="reves">{t('addMatch.reves')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.opponent2')}</Label>
                <Select value={opponent2Id || undefined} onValueChange={setOpponent2Id}>
                  <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                    <SelectValue placeholder={t('addMatch.selectOpponent2')} />
                  </SelectTrigger>
                  <SelectContent>
                    {opponent2Options.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {getPlayerDisplayName(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">{t('addMatch.side')}</Label>
                <Select
                  value={opponent1Position ? oppositeSide(opponent1Position) : undefined}
                  onValueChange={(v) => setOpponent1Position(oppositeSide(v as CourtSide))}
                >
                  <SelectTrigger className="w-full justify-between bg-input border-border font-normal h-10">
                    <SelectValue placeholder={t('addMatch.side')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="derecha">{t('addMatch.derecha')}</SelectItem>
                    <SelectItem value="reves">{t('addMatch.reves')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-base font-semibold text-foreground">{t('addMatch.result')}</h2>
            <div className="flex gap-3 mb-3 items-center">
              <div className="w-12" />
              <p className="flex-1 text-center text-xs font-bold uppercase tracking-wide text-foreground">{t('addMatch.us')}</p>
              <p className="flex-1 text-center text-xs font-bold uppercase tracking-wide text-foreground">{t('addMatch.them')}</p>
            </div>
            {[
              { key: 'set1', label: t('partidoDetail.set1'), my: set1My, opp: set1Opp, setMy: setSet1My, setOpp: setSet1Opp, show: true },
              { key: 'set2', label: t('partidoDetail.set2'), my: set2My, opp: set2Opp, setMy: setSet2My, setOpp: setSet2Opp, show: true },
              { key: 'set3', label: t('partidoDetail.set3'), my: set3My, opp: set3Opp, setMy: setSet3My, setOpp: setSet3Opp, show: needsThirdSet },
            ].map((row) =>
              row.show ? (
                <div key={row.key} className="flex gap-3 items-center mb-2.5">
                  <p className="w-12 text-sm font-semibold text-foreground">{row.label}</p>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={row.my}
                    onChange={(e) => row.setMy(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-center text-lg font-bold"
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={row.opp}
                    onChange={(e) => row.setOpp(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-center text-lg font-bold"
                  />
                </div>
              ) : null
            )}
        </section>

        {error && (
          <p className="text-sm text-center py-2.5 rounded-xl text-destructive bg-destructive/10">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full py-6 gap-2">
          <CheckCircle size={18} />
          {submitting ? t('addMatch.saving') : t('addMatch.save')}
        </Button>
      </form>
    </div>
  );
}
