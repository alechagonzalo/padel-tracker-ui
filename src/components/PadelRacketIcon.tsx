interface Props {
  size?: number;
  color?: string;
}

export function PadelRacketIcon({ size = 28, color = '#fff' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="9" rx="7" ry="8" stroke={color} strokeWidth="2" fill="none" />
      <line x1="12" y1="17" x2="12" y2="23" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="9" cy="7" r="1" fill={color} />
      <circle cx="12" cy="7" r="1" fill={color} />
      <circle cx="15" cy="7" r="1" fill={color} />
      <circle cx="10.5" cy="10" r="1" fill={color} />
      <circle cx="13.5" cy="10" r="1" fill={color} />
    </svg>
  );
}
