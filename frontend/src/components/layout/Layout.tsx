import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Importar componentes de layout
import Header from './Header';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

// Importar hooks
import { useIsAuthenticated, useUserRole } from '../../store/authStore';

// Props del componente Layout
interface LayoutProps {
  children: React.ReactNode;
}

// Componente principal de Layout
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();

  // Efecto para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Efecto para cerrar sidebar en mobile al cambiar de ruta
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Si no está autenticado, mostrar solo el contenido
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        isMobile={isMobile}
      />

      {/* Sidebar para desktop */}
      {!isMobile && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={userRole}
        />
      )}

      {/* Sidebar para mobile */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <MobileMenu
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userRole={userRole}
          />
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <main
        className={`transition-all duration-300 ${
          !isMobile && sidebarOpen
            ? 'lg:ml-64'
            : 'lg:ml-0'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Animación de entrada para el contenido */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Breadcrumb */}
            <Breadcrumb pathname={location.pathname} />

            {/* Contenido de la página */}
            {children}
          </motion.div>
        </div>
      </main>

      {/* Overlay para mobile cuando sidebar está abierto */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de breadcrumb
interface BreadcrumbProps {
  pathname: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pathname }) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    
    // Mapear nombres amigables para los segmentos
    const getSegmentName = (seg: string) => {
      switch (seg) {
        case 'dashboard':
          return 'Dashboard';
        case 'profile':
          return 'Perfil';
        case 'sessions':
          return 'Sesiones';
        case 'caseload':
          return 'Estudiantes';
        case 'games':
          return 'Juegos';
        case 'slp':
          return 'Terapeuta';
        case 'child':
          return 'Estudiante';
        default:
          return seg.charAt(0).toUpperCase() + seg.slice(1);
      }
    };

    return (
      <li key={path} className="flex items-center">
        {index > 0 && (
          <svg
            className="w-4 h-4 text-gray-400 mx-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        
        {isLast ? (
          <span className="text-sm font-medium text-gray-900">
            {getSegmentName(segment)}
          </span>
        ) : (
          <span className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            {getSegmentName(segment)}
          </span>
        )}
      </li>
    );
  });

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <span className="text-gray-500">Inicio</span>
        </li>
        {breadcrumbItems}
      </ol>
    </nav>
  );
};

export default Layout;


