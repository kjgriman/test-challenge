import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Importar componentes de layout
import Layout from './components/layout/Layout';

// Importar hooks de autenticación
import { useAuthStore, useIsAuthenticated, useIsInitialized } from './store/authStore';

// Importar páginas (lazy loading para mejor performance)
const LandingPage = React.lazy(() => import('./pages/Landing'));
const LoginPage = React.lazy(() => import('./pages/Login'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPassword'));
const DashboardPage = React.lazy(() => import('./pages/Dashboard'));
const SessionsPage = React.lazy(() => import('./pages/Sessions'));
const SessionsActivePage = React.lazy(() => import('./pages/SessionsActive'));
const SessionsScheduledPage = React.lazy(() => import('./pages/SessionsScheduled'));
const SessionsHistoryPage = React.lazy(() => import('./pages/SessionsHistory'));
const StudentsPage = React.lazy(() => import('./pages/Students'));
const AddStudentPage = React.lazy(() => import('./pages/AddStudent'));
const StudentEvaluationsPage = React.lazy(() => import('./pages/StudentEvaluations'));
const WebRTCDiagnosticsPage = React.lazy(() => import('./pages/WebRTCDiagnostics'));
const WebRTCTestPage = React.lazy(() => import('./pages/WebRTCTest'));
const WebRTCTestSimplePage = React.lazy(() => import('./pages/WebRTCTestSimple'));
const PeerJSTestPage = React.lazy(() => import('./pages/PeerJSTest'));
const HTTPSDiagnosticsPage = React.lazy(() => import('./pages/HTTPSDiagnostics'));
const VideoConferenceRoomPage = React.lazy(() => import('./pages/VideoConferenceRoom'));
const FullVideoConferencePage = React.lazy(() => import('./pages/FullVideoConference'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications'));
const GamesPage = React.lazy(() => import('./pages/Games'));
const CreateGamePage = React.lazy(() => import('./pages/CreateGame'));
const ReportsPage = React.lazy(() => import('./pages/Reports'));
const ReportsProgressPage = React.lazy(() => import('./pages/ReportsProgress'));
const ReportsSessionsPage = React.lazy(() => import('./pages/ReportsSessions'));
const VideoRoomsPage = React.lazy(() => import('./pages/VideoRooms'));

// Componente de carga
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Componente de ruta protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useIsInitialized();

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente principal de rutas
const AppRoutes: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useIsInitialized();

  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPasswordPage />
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ResetPasswordPage />
            )
          }
        />

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

        {/* Rutas de estudiantes */}
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <StudentsPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/add"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <AddStudentPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/students/evaluations"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <StudentEvaluationsPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Rutas de diagnóstico WebRTC */}
        <Route
          path="/webrtc-diagnostics"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <WebRTCDiagnosticsPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/webrtc-test"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <WebRTCTestPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/webrtc-simple"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <WebRTCTestSimplePage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/peerjs-test"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <PeerJSTestPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/https-diagnostics"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <HTTPSDiagnosticsPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Rutas de videoconferencias */}
        <Route
          path="/video-conference"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <VideoConferenceRoomPage />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/full-video-conference"
          element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <FullVideoConferencePage />
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

        {/* Rutas de salas de video */}
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

        {/* Ruta catch-all para manejar refreshes */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
