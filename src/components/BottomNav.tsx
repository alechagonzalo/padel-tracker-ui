import { NavLink } from 'react-router-dom';
import { Home, Users, Building2, User } from './icons';
import { PadelRacketIcon } from './PadelRacketIcon';
import { colors } from '@/lib/colors';

const tabs = [
  { to: '/inicio', Icon: Home, label: 'Inicio' },
  { to: '/jugadores', Icon: Users, label: 'Jugadores' },
  { to: '/add', Icon: null, label: 'Añadir' },
  { to: '/clubes', Icon: Building2, label: 'Clubes' },
  { to: '/perfil', Icon: User, label: 'Perfil' },
];

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around pb-safe"
      style={{
        backgroundColor: colors.card,
        borderTop: `1px solid ${colors.border}`,
        paddingBottom: `calc(env(safe-area-inset-bottom) + 8px)`,
        paddingTop: '8px',
        maxWidth: '480px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
      }}
    >
      {tabs.map((tab) =>
        tab.Icon === null ? (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="flex flex-col items-center justify-center -mt-4"
          >
            {({ isActive }) => (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: isActive ? '#5a4f22' : colors.primary }}
              >
                <PadelRacketIcon size={26} color={colors.primaryForeground} />
              </div>
            )}
          </NavLink>
        ) : (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="flex flex-col items-center gap-0.5 px-2 py-1"
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
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        )
      )}
    </nav>
  );
}
