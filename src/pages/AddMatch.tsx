import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getPlayerDisplayName } from '@/lib/utils';
import { Calendar, ChevronDown, X, CheckCircle } from '@/components/icons';
import { matches as matchesApi } from '@/lib/api';
import { appTypeToApiType, appResultToApiOutcome, scoreToResultString } from '@/lib/apiMappers';
import { usePlayers } from '@/hooks/usePlayers';
import { revalidateMatches } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MatchType } from '@/types';

type SelectModal = 'partner' | 'opponent1' | 'opponent2' | null;

export default function AddMatchPage() {
  const navigate = useNavigate();
  const { playersList } = usePlayers();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [opponent1Id, setOpponent1Id] = useState('');
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
  const [selectModal, setSelectModal] = useState<SelectModal>(null);

  const s1My = parseInt(set1My) || 0;
  const s1Opp = parseInt(set1Opp) || 0;
  const s2My = parseInt(set2My) || 0;
  const s2Opp = parseInt(set2Opp) || 0;
  const s3My = parseInt(set3My) || 0;
  const s3Opp = parseInt(set3Opp) || 0;
  const mySetWins = (s1My > s1Opp ? 1 : 0) + (s2My > s2Opp ? 1 : 0) + (s3My > s3Opp ? 1 : 0);
  const oppSetWins = (s1Opp > s1My ? 1 : 0) + (s2Opp > s2My ? 1 : 0) + (s3Opp > s3My ? 1 : 0);
  const needsThirdSet = mySetWins === 1 && oppSetWins === 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !opponent1Id || !opponent2Id || !location.trim()) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    const score = {
      set1: { team1: s1My, team2: s1Opp },
      set2: { team1: s2My, team2: s2Opp },
      ...(s3My || s3Opp ? { set3: { team1: s3My, team2: s3Opp } } : {}),
    };
    const outcome = mySetWins > oppSetWins ? 'won' : 'lost';
    const dateIso = new Date(`${date}T${time}:00`).toISOString();
    setSubmitting(true);
    setError('');
    try {
      await matchesApi.create({
        result: scoreToResultString(score),
        club: location.trim(),
        date: dateIso,
        outcome: appResultToApiOutcome(outcome),
        type: appTypeToApiType(category),
        playerIds: [partnerId, opponent1Id, opponent2Id],
      });
      await revalidateMatches();
      navigate('/inicio', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const getPlayerName = (id: string) => {
    const p = playersList.find((x) => x.id === id);
    return p ? getPlayerDisplayName(p) : '';
  };

  const SelectTrigger = ({ label, value, onClick }: { label: string; value: string; onClick: () => void }) => (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide">{label}</Label>
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        className="w-full justify-between bg-input border-border font-normal"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || `Seleccionar ${label.toLowerCase()}`}
        </span>
        <ChevronDown size={18} className="text-muted-foreground" />
      </Button>
    </div>
  );

  const modalOptions: { modal: SelectModal; data: typeof playersList; setter: (id: string) => void }[] = [
    { modal: 'partner', data: playersList.filter((p) => p.id !== opponent1Id && p.id !== opponent2Id), setter: setPartnerId },
    { modal: 'opponent1', data: playersList.filter((p) => p.id !== partnerId && p.id !== opponent2Id), setter: setOpponent1Id },
    { modal: 'opponent2', data: playersList.filter((p) => p.id !== partnerId && p.id !== opponent1Id), setter: setOpponent2Id },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-32 pt-14 px-4 bg-background">
      <h1 className="text-2xl font-bold text-foreground">Nuevo partido</h1>
      <p className="text-sm mt-0.5 mb-5 text-muted-foreground">Registra tu resultado</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Cuándo y Dónde */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar size={18} className="text-primary" />
              Cuándo y Dónde
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">Fecha</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">Hora</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">Club</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nombre del club o pista"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wide">Tipo</Label>
              <div className="flex rounded-lg p-0.5 bg-muted">
                {(['friendly', 'tournament'] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant="ghost"
                    onClick={() => setCategory(t)}
                    className={`flex-1 rounded-md text-sm font-semibold transition-all h-10 ${
                      category === t
                        ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                        : 'text-muted-foreground hover:bg-transparent hover:text-muted-foreground'
                    }`}
                  >
                    {t === 'friendly' ? 'Amistoso' : 'Torneo'}
                  </Button>
                ))}
              </div>
            </div>

            {category === 'tournament' && (
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide">Nombre torneo</Label>
                <Input
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="Nombre del torneo"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jugadores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Jugadores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide -mb-1">Tu equipo</p>
            <SelectTrigger label="Tu compañero" value={getPlayerName(partnerId)} onClick={() => setSelectModal('partner')} />

            <div className="rounded-xl p-3 bg-destructive/5 border border-destructive/20">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3 text-destructive">Rivales</p>
              <div className="flex flex-col gap-3">
                <SelectTrigger label="Rival 1" value={getPlayerName(opponent1Id)} onClick={() => setSelectModal('opponent1')} />
                <SelectTrigger label="Rival 2" value={getPlayerName(opponent2Id)} onClick={() => setSelectModal('opponent2')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-3 items-center">
              <div className="w-12" />
              <p className="flex-1 text-center text-xs font-bold uppercase tracking-wide text-foreground">Nosotros</p>
              <p className="flex-1 text-center text-xs font-bold uppercase tracking-wide text-foreground">Ellos</p>
            </div>
            {[
              { label: 'Set 1', my: set1My, opp: set1Opp, setMy: setSet1My, setOpp: setSet1Opp, show: true },
              { label: 'Set 2', my: set2My, opp: set2Opp, setMy: setSet2My, setOpp: setSet2Opp, show: true },
              { label: 'Set 3', my: set3My, opp: set3Opp, setMy: setSet3My, setOpp: setSet3Opp, show: needsThirdSet },
            ].map((row) =>
              row.show ? (
                <div key={row.label} className="flex gap-3 items-center mb-2.5">
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
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-center py-2.5 rounded-xl text-destructive bg-destructive/10">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full py-6 gap-2">
          <CheckCircle size={18} />
          {submitting ? 'Guardando...' : 'Guardar partido'}
        </Button>
      </form>

      {/* Bottom sheet for player selection */}
      <AnimatePresence>
        {selectModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSelectModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="rounded-t-3xl overflow-hidden bg-background"
              style={{ maxHeight: '70vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <p className="text-lg font-bold text-foreground">
                  {selectModal === 'partner' && 'Tu compañero'}
                  {selectModal === 'opponent1' && 'Rival 1'}
                  {selectModal === 'opponent2' && 'Rival 2'}
                </p>
                <Button variant="ghost" size="icon" onClick={() => setSelectModal(null)}>
                  <X size={22} />
                </Button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 64px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {modalOptions.find((o) => o.modal === selectModal)?.data.map((p) => (
                  <Button
                    key={p.id}
                    variant="ghost"
                    className="w-full justify-start rounded-none px-4 py-3.5 h-auto border-b border-border text-foreground font-medium text-base"
                    onClick={() => {
                      modalOptions.find((o) => o.modal === selectModal)?.setter(p.id);
                      setSelectModal(null);
                    }}
                  >
                    {getPlayerDisplayName(p)}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
