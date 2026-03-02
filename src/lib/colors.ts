/**
 * Paleta v0: tonos tierra/beige, verde acento, primario dorado.
 * Diseño limpio tipo PadelTrack.
 */
export const colors = {
  background: '#F5F0E8',
  foreground: '#3D3225',
  card: '#FDF9F3',
  cardForeground: '#3D3225',
  primary: '#7A6C2F',
  primaryForeground: '#FBF7EE',
  secondary: '#EBE3D5',
  secondaryForeground: '#4A3F2E',
  muted: '#EBE3D5',
  mutedForeground: '#8A7D6B',
  accent: '#4C8C50',
  accentForeground: '#FBF7EE',
  destructive: '#C4451A',
  destructiveForeground: '#FAF5EF',
  border: '#DDD5C7',
  input: '#F0E9DB',
  ring: '#7A6C2F',
  success: '#4C8C50',
  warning: '#B89A30',
} as const;

export type ColorKey = keyof typeof colors;
