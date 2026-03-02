import { colors } from '@/lib/colors';

export function Spinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-40">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
      />
    </div>
  );
}
