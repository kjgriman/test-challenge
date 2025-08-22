import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Importar hooks y store
import { useAuthStore, useIsAuthenticated, useUserRole } from '../../store/authStore';
import PageLoader from '../common/PageLoader';

// Props del componente ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'slp' | 'child';
  redirectTo?: string;
  showLoader?: boolean;
}

// Componente principal de ProtectedRoute
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
  showLoader = true,
}) => {
  const location = useLocation();
  const { isInitialized } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();

  // Mostrar loader mientras se inicializa la autenticación
  if (!isInitialized && showLoader) {
    return (
      <PageLoader 
        message="Verificando autenticación..." 
        fullScreen={true}
      />
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Verificar rol si se requiere uno específico
  if (requiredRole && userRole !== requiredRole) {
    // Redirigir a una página de acceso denegado o al dashboard
    const accessDeniedPath = userRole === 'slp' ? '/dashboard' : '/dashboard';
    
    return (
      <Navigate
        to={accessDeniedPath}
        state={{ 
          from: location,
          message: `Acceso denegado. Se requiere rol de ${requiredRole === 'slp' ? 'Terapeuta' : 'Estudiante'}.`
        }}
        replace
      />
    );
  }

  // Usuario autenticado y con rol correcto, mostrar contenido
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;


