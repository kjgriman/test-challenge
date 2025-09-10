import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Calendar,
  Users,
  Gamepad2,
  BarChart3,
  Settings,
  User,
  BookOpen,
  MessageSquare,
  Video,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  Plus,
  Camera
} from 'lucide-react';

// Importar hooks
import { useUserRole, useProfileInfo } from '../../store/authStore';

// Props del componente Sidebar
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'slp' | 'child' | undefined;
}

// Tipos para los elementos del menú
interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: MenuItem[];
}

// Componente principal de Sidebar
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const profileInfo = useProfileInfo();

  // Función para alternar elementos expandibles
  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Función para verificar si un elemento está activo
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Función para verificar si un elemento tiene hijos activos
  const hasActiveChild = (children: MenuItem[]) => {
    return children.some(child => isActive(child.href));
  };

  // Menú para SLP
  const slpMenuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Sesiones',
      href: '/sessions',
      icon: Calendar,
      children: [
        {
          name: 'Todas las Sesiones',
          href: '/sessions',
          icon: Calendar,
        },
        {
          name: 'Sesiones Activas',
          href: '/sessions/active',
          icon: Video,
        },
        {
          name: 'Sesiones Programadas',
          href: '/sessions/scheduled',
          icon: Clock,
        },
        {
          name: 'Historial',
          href: '/sessions/history',
          icon: FileText,
        },
      ],
    },
    {
      name: 'Estudiantes',
      href: '/students',
      icon: Users,
      children: [
        {
          name: 'Mi Caseload',
          href: '/students',
          icon: Users,
        },
        {
          name: 'Agregar Estudiante',
          href: '/students/add',
          icon: User,
        },
        {
          name: 'Evaluaciones',
          href: '/students/evaluations',
          icon: FileText,
        },
      ],
    },
    {
      name: 'Juegos',
      href: '/games',
      icon: Gamepad2,
      children: [
        {
          name: 'Crear Juego',
          href: '/games/create',
          icon: Plus,
        },
        {
          name: 'Juegos Activos',
          href: '/games/active',
          icon: Video,
        },
        {
          name: 'Biblioteca',
          href: '/games/library',
          icon: BookOpen,
        },
      ],
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: BarChart3,
      children: [
        {
          name: 'Progreso General',
          href: '/reports/progress',
          icon: BarChart3,
        },
        {
          name: 'Sesiones por Estudiante',
          href: '/reports/sessions',
          icon: Calendar,
        },
        {
          name: 'Métricas de Juegos',
          href: '/reports/games',
          icon: Gamepad2,
        },
      ],
    },
    {
      name: 'Videoconferencias',
      href: '/video-rooms',
      icon: Video,
      children: [
        {
          name: 'Mis Salas',
          href: '/video-rooms',
          icon: Video,
        },
        {
          name: 'Crear Sala',
          href: '/video-rooms',
          icon: Video,
        },
        {
          name: 'Unirse por Código',
          href: '/join-room',
          icon: Video,
        },
        {
          name: 'Diagnóstico WebRTC',
          href: '/webrtc-diagnostics',
          icon: Settings,
        },
        {
          name: 'Prueba WebRTC',
          href: '/webrtc-test',
          icon: Video,
        },
        {
          name: 'Prueba Simple',
          href: '/webrtc-simple',
          icon: Camera,
        },
        {
          name: 'Prueba PeerJS',
          href: '/peerjs-test',
          icon: Camera,
        },
        {
          name: 'Diagnóstico HTTPS',
          href: '/https-diagnostics',
          icon: Camera,
        },
      ],
    },
    // Sección de comunicación oculta - las notificaciones están disponibles en el header
    // {
    //   name: 'Comunicación',
    //   href: '/communication',
    //   icon: MessageSquare,
    //   children: [
    //     {
    //       name: 'Chat con Padres',
    //       href: '/communication/chat',
    //       icon: MessageSquare,
    //     },
    //     {
    //       name: 'Notificaciones',
    //       href: '/notifications',
    //       icon: Bell,
    //     },
    //     {
    //       name: 'Correos',
    //       href: '/communication/emails',
    //       icon: FileText,
    //     },
    //   ],
    // },
  ];

  // Menú para Child
  const childMenuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Mis Sesiones',
      href: '/sessions',
      icon: Calendar,
      children: [
        {
          name: 'Sesiones Programadas',
          href: '/sessions/scheduled',
          icon: Calendar,
        },
        {
          name: 'Sesiones Activas',
          href: '/sessions/active',
          icon: Video,
        },
        {
          name: 'Historial',
          href: '/sessions/history',
          icon: FileText,
        },
      ],
    },
    {
      name: 'Juegos',
      href: '/games',
      icon: Gamepad2,
      children: [
        {
          name: 'Juegos Disponibles',
          href: '/games/available',
          icon: Gamepad2,
        },
        {
          name: 'Mis Progresos',
          href: '/games/progress',
          icon: Award,
        },
        {
          name: 'Logros',
          href: '/games/achievements',
          icon: Award,
        },
      ],
    },
    {
      name: 'Videoconferencias',
      href: '/video-rooms',
      icon: Video,
      children: [
        {
          name: 'Unirse a Sala',
          href: '/join-room',
          icon: Video,
        },
        {
          name: 'Mis Sesiones',
          href: '/video-rooms',
          icon: Video,
        },
      ],
    },
    {
      name: 'Mi Progreso',
      href: '/progress',
      icon: BarChart3,
      children: [
        {
          name: 'Gráficos',
          href: '/progress/charts',
          icon: BarChart3,
        },
        {
          name: 'Objetivos',
          href: '/progress/goals',
          icon: Award,
        },
        {
          name: 'Reportes',
          href: '/progress/reports',
          icon: FileText,
        },
      ],
    },
    // Sección de comunicación oculta - las notificaciones están disponibles en el header
    // {
    //   name: 'Comunicación',
    //   href: '/communication',
    //   icon: MessageSquare,
    //   children: [
    //     {
    //       name: 'Chat con Terapeuta',
    //       href: '/communication/chat',
    //       icon: MessageSquare,
    //     },
    //     {
    //       name: 'Notificaciones',
    //       href: '/notifications',
    //       icon: Bell,
    //     },
    //   ],
    // },
  ];

  // Seleccionar menú basado en el rol
  const menuItems = userRole === 'slp' ? slpMenuItems : childMenuItems;

  // Renderizar elemento del menú
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActiveItem = isActive(item.href);
    const hasActiveChildren = item.children && hasActiveChild(item.children);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.name}>
        {/* Elemento principal del menú */}
        <div className="relative">
          <Link
            to={item.href}
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.name);
              }
            }}
            className={`
              group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${level === 0 ? 'mx-2' : 'mx-4'}
              ${isActiveItem || hasActiveChildren
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {/* Icono */}
            <item.icon
              className={`
                mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                ${isActiveItem || hasActiveChildren
                  ? 'text-primary-600'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `}
            />

            {/* Nombre del elemento */}
            {!isCollapsed && (
              <span className="flex-1">{item.name}</span>
            )}

            {/* Badge */}
            {item.badge && !isCollapsed && (
              <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {item.badge}
              </span>
            )}

            {/* Indicador de expansión */}
            {hasChildren && !isCollapsed && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
              </motion.div>
            )}
          </Link>
        </div>

        {/* Elementos hijos */}
        {hasChildren && !isCollapsed && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-1">
                  {item.children!.map(child => renderMenuItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      initial={{ x: -256 }}
      animate={{ x: isOpen ? 0 : -256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`
        fixed inset-y-0 left-0 z-40 bg-white shadow-large border-r border-gray-200
        ${isCollapsed ? 'w-16' : 'w-64'}
        transition-all duration-300 ease-in-out
      `}
    >
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-therapy rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Terapia
            </span>
          </div>
        )}

        {/* Botón para colapsar/expandir */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Información del usuario */}
      {!isCollapsed && profileInfo && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-therapy rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {profileInfo.type.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {profileInfo.title}
              </p>
              <p className="text-xs text-gray-500">
                {profileInfo.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación principal */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer del sidebar */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            {/* Enlace a configuración */}
            <Link
              to="/settings"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400" />
              Configuración
            </Link>

            {/* Enlace a perfil */}
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <User className="mr-3 h-5 w-5 text-gray-400" />
              Mi Perfil
            </Link>
          </div>
        </div>
      )}

      {/* Versión colapsada - solo iconos */}
      {isCollapsed && (
        <div className="px-2 py-4 space-y-1">
          {menuItems.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center justify-center p-3 text-sm font-medium rounded-md transition-colors duration-200
                ${isActive(item.href)
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={item.name}
            >
              <item.icon
                className={`
                  h-5 w-5 transition-colors duration-200
                  ${isActive(item.href)
                    ? 'text-primary-600'
                    : 'text-gray-400 group-hover:text-gray-500'
                  }
                `}
              />
            </Link>
          ))}
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
