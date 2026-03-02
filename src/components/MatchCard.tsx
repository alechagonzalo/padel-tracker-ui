import { useNavigate } from 'react-router-dom';
import { Calendar, Trash2 } from './icons';
import { colors } from '@/lib/colors';
import type { DisplayMatch } from '@/lib/matchDisplay';
import { getPlayerDisplayName } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  match: DisplayMatch;
  onDelete?: (id: string) => void;
}

export function MatchCard({ match, onDelete }: Props) {
  const navigate = useNavigate();

  const formattedDate = new Date(match.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const setsDisplay = match.result.myTeam
    .map((s, i) => `${s}-${match.result.opponentTeam[i]}`)
    .join('  ');

  return (
    <div
      className="rounded-xl p-4 mb-3 cursor-pointer border-l-4 active:opacity-80 transition-opacity"
      style={{
        backgroundColor: colors.card,
        borderColor: match.won ? colors.success : colors.destructive,
        outline: `1px solid ${match.won ? colors.success + '30' : colors.destructive + '30'}`,
      }}
      onClick={() => navigate(`/partido/${match.id}`)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{
              backgroundColor: match.won ? colors.success + '18' : colors.destructive + '18',
              color: match.won ? colors.success : colors.destructive,
            }}
          >
            {match.won ? 'Victoria' : 'Derrota'}
          </span>
          {match.category === 'competitive' && (
            <span
              className="px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ backgroundColor: colors.primary + '18', color: colors.primary }}
            >
              Torneo
            </span>
          )}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(match.id);
            }}
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      <p className="text-xs mb-3 flex items-center gap-1" style={{ color: colors.mutedForeground }}>
        <Calendar size={12} />
        {formattedDate} - {match.location}
      </p>

      <div className="flex items-center mb-2">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: colors.mutedForeground }}>Tu equipo</p>
          <p className="text-sm font-semibold" style={{ color: colors.foreground }}>
            Tu + {getPlayerDisplayName(match.partner)}
          </p>
        </div>
        <span className="text-xs mx-2" style={{ color: colors.mutedForeground }}>vs</span>
        <div className="flex-1 text-right">
          <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: colors.mutedForeground }}>Rivales</p>
          <p className="text-sm font-semibold" style={{ color: colors.foreground }}>
            {getPlayerDisplayName(match.opponents[0])} + {getPlayerDisplayName(match.opponents[1])}
          </p>
        </div>
      </div>

      <div
        className="rounded-lg py-2 flex items-center justify-center mt-1"
        style={{ backgroundColor: colors.muted }}
      >
        <span className="text-base font-bold tracking-widest" style={{ color: colors.foreground }}>
          {setsDisplay}
        </span>
      </div>

      {match.tournamentName ? (
        <p className="text-xs italic mt-2" style={{ color: colors.mutedForeground }}>{match.tournamentName}</p>
      ) : null}
    </div>
  );
}
