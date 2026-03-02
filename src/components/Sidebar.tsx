import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Users, Building2, User } from './icons';
import { PadelRacketIcon } from './PadelRacketIcon';
import { colors } from '@/lib/colors';
import { useAddMatchModal } from '@/context/AddMatchModalContext';

const navItemKeys = [
  { to: '/inicio', Icon: Home, labelKey: 'nav.inicio' as const },
  { to: '/jugadores', Icon: Users, labelKey: 'nav.jugadores' as const },
  { to: '/add', Icon: null, labelKey: 'nav.addMatch' as const },
  { to: '/clubes', Icon: Building2, labelKey: 'nav.clubes' as const },
  { to: '/perfil', Icon: User, labelKey: 'nav.perfil' as const },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const { openAddMatchModal } = useAddMatchModal();

  return (
    <aside
      className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 w-56 border-r"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center gap-2 px-5 py-6 border-b" style={{ borderColor: colors.border }}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <PadelRacketIcon size={20} color={colors.primaryForeground} />
        </div>
        <span className="font-bold text-foreground text-lg">{t('app.name')}</span>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 p-3 pt-4 overflow-y-auto">
        {navItemKeys.map((item) =>
          item.Icon === null ? (
            <button
              key={item.to}
              type="button"
              onClick={openAddMatchModal}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors w-full text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                <PadelRacketIcon size={20} color={colors.primaryForeground} />
              </div>
              <span className="text-sm" style={{ color: colors.foreground }}>
                {t(item.labelKey)}
              </span>
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors"
            >
              {({ isActive }) => (
                <>
                  <item.Icon
                    size={20}
                    color={isActive ? colors.primary : colors.mutedForeground}
                  />
                  <span
                    className="text-sm"
                    style={{ color: isActive ? colors.primary : colors.foreground }}
                  >
                    {t(item.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          )
        )}
      </nav>
      {/* Selector de idioma */}
      <div className="p-3 border-t shrink-0" style={{ borderColor: colors.border }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
          {t('common.language')}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => i18n.changeLanguage('es')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: i18n.language === 'es' ? colors.primary : 'transparent',
              color: i18n.language === 'es' ? colors.primaryForeground : colors.mutedForeground,
            }}
          >
            {t('common.spanish')}
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: i18n.language === 'en' ? colors.primary : 'transparent',
              color: i18n.language === 'en' ? colors.primaryForeground : colors.mutedForeground,
            }}
          >
            {t('common.english')}
          </button>
        </div>
      </div>
    </aside>
  );
}
