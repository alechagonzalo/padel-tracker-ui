import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { PadelRacketIcon } from '@/components/PadelRacketIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError(t('login.errorPasswordsMismatch'));
      return;
    }
    setLoading(true);
    try {
      let ok: boolean;
      if (mode === 'login') {
        ok = await login(email, password);
      } else {
        ok = await register(email, password, firstName, lastName);
      }
      if (ok) {
        navigate('/inicio', { replace: true });
      } else {
        setError(mode === 'login' ? t('login.errorInvalidCredentials') : t('login.errorRegisterFailed'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('login.errorUnknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md bg-primary">
            <PadelRacketIcon size={32} color="var(--primary-foreground)" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t('app.name')}</h1>
          <p className="text-sm mt-1 text-muted-foreground">{t('app.tagline')}</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            {/* Tab selector */}
            <div className="flex rounded-lg p-0.5 mb-6 bg-muted">
              {(['login', 'register'] as const).map((m) => (
                <Button
                  key={m}
                  variant="ghost"
                  onClick={() => {
                    setMode(m);
                    setError('');
                    setConfirmPassword('');
                    setShowPassword(false);
                  }}
                  className={`flex-1 rounded-md text-sm font-medium transition-all h-9 ${
                    mode === m
                      ? 'bg-card text-foreground shadow-sm hover:bg-card'
                      : 'text-muted-foreground hover:bg-transparent hover:text-muted-foreground'
                  }`}
                >
                  {m === 'login' ? t('login.signIn') : t('login.register')}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">{t('login.firstName')}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t('login.firstNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">{t('login.lastName')}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('login.lastNamePlaceholder')}
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.passwordPlaceholder')}
                    required
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('login.hidePasswordAria') : t('login.showPasswordAria')}
                  >
                    {showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  </Button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">{t('login.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('login.passwordPlaceholder')}
                      required
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t('login.hidePasswordAria') : t('login.showPasswordAria')}
                    >
                      {showPassword ? t('login.hidePassword') : t('login.showPassword')}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-center py-2 rounded-lg text-destructive bg-destructive/10">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading ? t('login.loading') : mode === 'login' ? t('login.signIn') : t('login.createAccount')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
