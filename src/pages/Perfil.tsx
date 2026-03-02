import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { calculateStats } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Spinner } from '@/components/Spinner';
import { Pencil, Check, X, LogOut } from '@/components/icons';
import { useMatches } from '@/hooks/useMatches';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PerfilPage() {
  const { t, i18n } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const { matchesList, isLoading } = useMatches();

  function displayName(fn: string, ln: string) {
    return [fn, ln].filter(Boolean).join(' ').trim() || t('inicio.playerDefault');
  }

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [editing, setEditing] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user?.firstName, user?.lastName]);

  const stats = calculateStats(matchesList);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const statRows = [
    { label: t('perfil.matchesPlayed'), value: stats.totalMatches, color: 'text-foreground' },
    { label: t('perfil.victories'), value: stats.wins, color: 'text-success' },
    { label: t('perfil.defeats'), value: stats.losses, color: 'text-destructive' },
    { label: t('perfil.winRate'), value: `${stats.winRate}%`, color: 'text-foreground' },
    { label: t('perfil.bestStreak'), value: stats.bestStreak, color: 'text-foreground' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-32 md:pb-0 pt-14 md:pt-0 px-4 bg-background">
      <h1 className="text-2xl font-bold mb-5 text-foreground">{t('perfil.title')}</h1>

      {/* Idioma */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-sm font-bold mb-2 text-foreground">{t('common.language')}</p>
          <div className="flex gap-2">
            <Button
              variant={i18n.language === 'es' ? 'default' : 'outline'}
              size="sm"
              onClick={() => i18n.changeLanguage('es')}
            >
              {t('common.spanish')}
            </Button>
            <Button
              variant={i18n.language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => i18n.changeLanguage('en')}
            >
              {t('common.english')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Avatar + edición */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 shrink-0">
              <AvatarFallback className="text-2xl font-bold bg-primary/15 text-primary">
                {(firstName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex flex-col gap-2">
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('perfil.name')}
                    autoFocus
                  />
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('perfil.lastName')}
                  />
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-success hover:text-success hover:bg-success/10"
                      onClick={() => { updateUser({ firstName, lastName }); setEditing(false); }}
                    >
                      <Check size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setFirstName(user?.firstName ?? '');
                        setLastName(user?.lastName ?? '');
                        setEditing(false);
                      }}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-foreground">{displayName(firstName, lastName)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </div>
                  <p className="text-sm mt-0.5 text-muted-foreground">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-bold mb-3 text-foreground">{t('perfil.summary')}</p>
          {isLoading ? (
            <Spinner />
          ) : (
            statRows.map((row, i) => (
              <div key={row.label}>
                <div className="flex items-center justify-between py-2.5">
                  <p className="text-sm text-muted-foreground">{row.label}</p>
                  <p className={`text-sm font-bold ${row.color}`}>{row.value}</p>
                </div>
                {i < statRows.length - 1 && <Separator />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setShowSignOut(true)}
      >
        <LogOut size={18} />
        {t('perfil.signOut')}
      </Button>

      <ConfirmDialog
        open={showSignOut}
        title={t('perfil.signOutTitle')}
        message={t('perfil.signOutMessage')}
        confirmLabel={t('perfil.signOutConfirm')}
        destructive
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOut(false)}
      />
    </div>
  );
}
