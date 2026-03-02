import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PadelRacketIcon } from '@/components/PadelRacketIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
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
      setError('Las contraseñas no coinciden');
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
        setError(mode === 'login' ? 'Email o contraseña incorrectos' : 'No se pudo registrar');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
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
          <h1 className="text-3xl font-bold text-foreground">PadelTrack</h1>
          <p className="text-sm mt-1 text-muted-foreground">Registra tus partidos de pádel</p>
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
                  {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pr-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
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
                {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
