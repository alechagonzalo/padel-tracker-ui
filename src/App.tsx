import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Spinner } from '@/components/Spinner';

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
    <div
      className="flex flex-col min-h-screen mx-auto relative bg-background"
      style={{ maxWidth: '480px' }}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
      <BottomNav />
    </div>
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
