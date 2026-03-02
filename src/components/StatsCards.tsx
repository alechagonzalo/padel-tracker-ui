import { TennisBall, Trophy, XCircle, Flame } from './icons';
import { colors } from '@/lib/colors';
import type { Stats } from '@/lib/utils';

interface Props {
  stats: Stats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    { label: 'Partidos', value: stats.totalMatches, Icon: TennisBall, color: colors.primary },
    { label: 'Victorias', value: stats.wins, Icon: Trophy, color: colors.success },
    { label: 'Derrotas', value: stats.losses, Icon: XCircle, color: colors.destructive },
    { label: 'Racha actual', value: stats.currentStreak, Icon: Flame, color: colors.warning },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-3.5 border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: card.color + '18' }}
          >
            <card.Icon size={18} color={card.color} />
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.foreground }}>{card.value}</p>
          <p className="text-xs mt-0.5" style={{ color: colors.mutedForeground }}>{card.label}</p>
        </div>
      ))}
    </div>
  );
}
