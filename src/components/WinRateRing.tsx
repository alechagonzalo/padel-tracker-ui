import { colors } from '@/lib/colors';

interface Props {
  winRate: number;
  size?: number;
}

export function WinRateRing({ winRate, size = 120 }: Props) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (winRate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ position: 'absolute' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.muted}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="text-3xl font-bold" style={{ color: colors.foreground }}>{winRate}%</span>
        <span className="text-xs" style={{ color: colors.mutedForeground }}>Win Rate</span>
      </div>
    </div>
  );
}
