import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Importar componentes de layout
import Layout from './components/layout/Layout';
// import LoadingSpinner from './components/ui/LoadingSpinner';

// Importar hooks de autenticación
import { useAuthStore, useIsAuthenticated, useIsInitialized } from './store/authStore';

// Importar páginas (lazy loading para mejor performance)
const LandingPage = React.lazy(() => import('./pages/Landing'));
const LoginPage = React.lazy(() => import('./pages/Login'));
// const RegisterSLPPage = React.lazy(() => import('./pages/auth/RegisterSLPPage'));
// const RegisterChildPage = React.lazy(() => import('./pages/auth/RegisterChildPage'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard'));
const SessionsPage = React.lazy(() => import('./pages/Sessions'));
const SessionsActivePage = React.lazy(() => import('./pages/SessionsActive'));
const SessionsScheduledPage = React.lazy(() => import('./pages/SessionsScheduled'));
const SessionsHistoryPage = React.lazy(() => import('./pages/SessionsHistory'));
const StudentsPage = React.lazy(() => import('./pages/Students'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications'));
const GamesPage = React.lazy(() => import('./pages/Games'));
const CreateGamePage = React.lazy(() => import('./pages/CreateGame'));
const ReportsPage = React.lazy(() => import('./pages/Reports'));
const ReportsProgressPage = React.lazy(() => import('./pages/ReportsProgress'));
const ReportsSessionsPage = React.lazy(() => import('./pages/ReportsSessions'));
const ReportsGamesPage = React.lazy(() => import('./pages/ReportsGames'));
const VideoRoomsPage = React.lazy(() => import('./pages/VideoRooms'));
// const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
// const SessionPage = React.lazy(() => import('./pages/sessions/SessionPage'));
// const GamesPage = React.lazy(() => import('./pages/games/GamesPage'));
// const GamePage = React.lazy(() => import('./pages/games/GamePage'));
// const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Componente de carga para lazy loading
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
    {/* <LoadingSpinner size="xl" />
     */}
     loading...
  </div>
);

// Componente de ruta protegida
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'slp' | 'child';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const isAuthenticated = useIsAuthenticated();
  const userRole = useAuthStore((state) => state.user?.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente principal de la aplicación
const App: React.FC = () => {
  const isInitialized = useIsInitialized();
  const isAuthenticated = useIsAuthenticated();

  // Efecto para manejar cambios en la autenticación
  useEffect(() => {
    if (isAuthenticated) {
      // Configurar interceptores de API, WebSocket, etc.
      console.log('🔐 Usuario autenticado, configurando servicios...');
    }
  }, [isAuthenticated]);

  // Mostrar pantalla de carga mientras se inicializa
  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <LandingPage />
              </motion.div>
            }
          />

          {/* Rutas de autenticación */}
          <Route
            path="/login"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              </motion.div>
            }
          />

          {/* <Route
            path="/register/slp"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<PageLoader />}>
                  <RegisterSLPPage />
                </Suspense>
              </motion.div>
            }
          /> */}
{/* 
          <Route
            path="/register/child"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<PageLoader />}>
                  <RegisterChildPage />
                </Suspense>
              </motion.div>
            }
          /> */}

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />
{/* 
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          /> */}

          {/* Rutas de sesiones */}
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <SessionsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions/active"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <SessionsActivePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions/scheduled"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <SessionsScheduledPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <SessionsHistoryPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/sessions/:sessionId"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <SessionPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          /> */}

          {/* Rutas de estudiantes (solo para SLP) */}
          <Route
            path="/students"
            element={
              <ProtectedRoute requiredRole="slp">
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <StudentsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de notificaciones */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <NotificationsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/students/:studentId"
            element={
              <ProtectedRoute requiredRole="slp">
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <StudentProfilePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          /> */}

          {/* Rutas de juegos */}
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <GamesPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/games/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <CreateGamePage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de reportes */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ReportsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/progress"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ReportsProgressPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/sessions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ReportsSessionsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/games"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <ReportsGamesPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Rutas de video conferencia */}
          <Route
            path="/video-rooms"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <VideoRoomsPage />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Ruta 404 */}
          {/* <Route
            path="*"
            element={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense fallback={<PageLoader />}>
                  <NotFoundPage />
                </Suspense>
              </motion.div>
            }
          /> */}
        </Routes>
      </AnimatePresence>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '400px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;


