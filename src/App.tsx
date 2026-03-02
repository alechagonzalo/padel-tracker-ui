import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AddMatchModalProvider } from '@/context/AddMatchModalContext';
import { health } from '@/lib/api';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { PadelRacketIcon } from '@/components/PadelRacketIcon';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/ui/button';

import LoginPage from '@/pages/Login';
import InicioPage from '@/pages/Inicio';
import PartidosPage from '@/pages/Partidos';
import PartidoDetailPage from '@/pages/PartidoDetail';
import JugadoresPage from '@/pages/Jugadores';
import ClubesPage from '@/pages/Clubes';
import PerfilPage from '@/pages/Perfil';
import AddMatchPage from '@/pages/AddMatch';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AddMatchModalProvider>
      <div className="flex flex-col min-h-screen md:flex-row relative bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 md:pl-56">
          <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full px-0 md:px-8 md:py-0">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </AddMatchModalProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/inicio" replace /> : <LoginPage />} />

      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route path="inicio" element={<InicioPage />} />
                <Route path="partidos" element={<PartidosPage />} />
                <Route path="partido/:id" element={<PartidoDetailPage />} />
                <Route path="jugadores" element={<JugadoresPage />} />
                <Route path="clubes" element={<ClubesPage />} />
                <Route path="perfil" element={<PerfilPage />} />
                <Route path="add" element={<AddMatchPage />} />
                <Route path="*" element={<Navigate to="/inicio" replace />} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        }
      />
    </Routes>
  );
}

type HealthStatus = 'loading' | 'up' | 'down';

function HealthGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<HealthStatus>('loading');

  const check = () => {
    setStatus('loading');
    health()
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'));
  };

  useEffect(() => {
    health()
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (status === 'down') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 bg-background text-foreground">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md bg-primary">
            <PadelRacketIcon size={32} color="var(--primary-foreground)" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('app.name')}</h1>
        </div>
        <p className="text-lg font-semibold text-center">{t('app.serviceUnavailable')}</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {t('app.serviceUnavailableHint')}
        </p>
        <Button onClick={check} variant="outline">
          {t('app.retry')}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <HealthGate>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HealthGate>
    </BrowserRouter>
  );
}
