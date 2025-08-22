import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Componente principal de Breadcrumb
const Breadcrumb: React.FC = () => {
  const location = useLocation();

  // Función para generar las migas de pan basadas en la ruta actual
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Agregar el home como primera miga
    breadcrumbs.push({
      name: 'Inicio',
      href: '/dashboard',
      icon: Home,
      isCurrent: pathnames.length === 0,
    });

    // Generar migas para cada segmento de la ruta
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      // Mapear nombres amigables para las rutas
      const friendlyName = getFriendlyName(pathname, pathnames, index);
      
      breadcrumbs.push({
        name: friendlyName,
        href: currentPath,
        isCurrent: index === pathnames.length - 1,
      });
    });

    return breadcrumbs;
  };

  // Función para obtener nombres amigables para las rutas
  const getFriendlyName = (pathname: string, pathnames: string[], index: number) => {
    const friendlyNames: { [key: string]: string } = {
      dashboard: 'Dashboard',
      sessions: 'Sesiones',
      schedule: 'Programar',
      active: 'Activas',
      history: 'Historial',
      caseload: 'Estudiantes',
      add: 'Agregar',
      evaluations: 'Evaluaciones',
      games: 'Juegos',
      create: 'Crear',
      library: 'Biblioteca',
      reports: 'Reportes',
      progress: 'Progreso',
      communication: 'Comunicación',
      chat: 'Chat',
      notifications: 'Notificaciones',
      emails: 'Correos',
      profile: 'Mi Perfil',
      settings: 'Configuración',
      help: 'Ayuda',
      scheduled: 'Programadas',
      available: 'Disponibles',
      achievements: 'Logros',
      goals: 'Objetivos',
      charts: 'Gráficos',
      messages: 'Mensajes',
    };

    return friendlyNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
  };

  const breadcrumbs = generateBreadcrumbs();

  // No mostrar breadcrumb en la página de inicio
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {/* Separador */}
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          )}

          {/* Enlace o texto de la miga */}
          {breadcrumb.isCurrent ? (
            <span className="text-gray-900 font-medium">
              {breadcrumb.icon ? (
                <breadcrumb.icon className="h-4 w-4 inline mr-1" />
              ) : null}
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              to={breadcrumb.href}
              className="flex items-center text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
            >
              {breadcrumb.icon ? (
                <breadcrumb.icon className="h-4 w-4 mr-1" />
              ) : null}
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;


