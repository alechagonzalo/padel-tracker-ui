import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Users, Building2, User } from './icons';
import { PadelRacketIcon } from './PadelRacketIcon';
import { colors } from '@/lib/colors';
import { useAddMatchModal } from '@/context/AddMatchModalContext';

const tabKeys = [
  { to: '/inicio', Icon: Home, labelKey: 'nav.inicio' as const },
  { to: '/jugadores', Icon: Users, labelKey: 'nav.jugadores' as const },
  { to: '/add', Icon: null, labelKey: 'nav.add' as const },
  { to: '/clubes', Icon: Building2, labelKey: 'nav.clubes' as const },
  { to: '/perfil', Icon: User, labelKey: 'nav.perfil' as const },
];

export function BottomNav() {
  const { t } = useTranslation();
  const { openAddMatchModal } = useAddMatchModal();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around pb-safe md:hidden"
      style={{
        backgroundColor: colors.card,
        borderTop: `1px solid ${colors.border}`,
        paddingBottom: `calc(env(safe-area-inset-bottom) + 12px)`,
        paddingTop: '12px',
        maxWidth: '480px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
      }}
    >
      {tabKeys.map((tab) =>
        tab.Icon === null ? (
          <button
            key={tab.to}
            type="button"
            onClick={openAddMatchModal}
            className="flex flex-col items-center justify-center -mt-4"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <PadelRacketIcon size={26} color={colors.primaryForeground} />
            </div>
          </button>
        ) : (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            {({ isActive }) => (
              <>
                <tab.Icon
                  size={22}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? colors.primary : colors.mutedForeground }}
                >
                  {t(tab.labelKey)}
                </span>
              </>
            )}
          </NavLink>
        )
      )}
    </nav>
  );
}
