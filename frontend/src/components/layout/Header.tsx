import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';

// Importar hooks y store
import { useAuthStore, useUser, useDisplayName, useProfileInfo } from '../../store/authStore';

// Props del componente Header
interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

// Componente principal de Header
const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const user = useUser();
  const displayName = useDisplayName();
  const profileInfo = useProfileInfo();

  // Función para manejar logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  // Función para alternar modo oscuro
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Aquí podrías implementar la lógica para cambiar el tema
    document.documentElement.classList.toggle('dark');
  };

  // Función para manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implementar lógica de búsqueda
      console.log('Buscando:', searchQuery);
      setSearchQuery('');
    }
  };

  // Función para navegar al perfil
  const goToProfile = () => {
    navigate('/profile');
    setIsProfileOpen(false);
  };

  // Función para navegar a configuración
  const goToSettings = () => {
    navigate('/settings');
    setIsProfileOpen(false);
  };

  // Función para navegar a ayuda
  const goToHelp = () => {
    navigate('/help');
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado izquierdo - Logo y botón de menú */}
          <div className="flex items-center">
            {/* Botón de menú para mobile */}
            {isMobile && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center">
              <div className="flex-shrink-0">
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
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Terapia del Habla</h1>
              </div>
            </Link>
          </div>

          {/* Centro - Barra de búsqueda */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar sesiones, estudiantes..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </form>
          </div>

          {/* Lado derecho - Acciones del usuario */}
          <div className="flex items-center space-x-4">
            {/* Botón de búsqueda para mobile */}
            {isMobile && (
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Botón de modo oscuro */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 relative"
              >
                <Bell className="h-5 w-5" />
                {/* Indicador de notificaciones */}
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-error-400 ring-2 ring-white"></span>
              </button>

              {/* Dropdown de notificaciones */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-large border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Lista de notificaciones */}
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-gray-900">
                              Nueva sesión programada para mañana
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Hace 2 horas
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-gray-900">
                              Progreso actualizado del estudiante
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Hace 1 día
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <Link
                        to="/notifications"
                        className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                      >
                        Ver todas las notificaciones
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Perfil del usuario */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user?.profilePicture ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profilePicture}
                      alt={displayName}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-therapy flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Nombre del usuario */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">
                    {profileInfo?.title || 'Usuario'}
                  </p>
                </div>

                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown del perfil */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-large border border-gray-200 py-1 z-50"
                  >
                    {/* Información del usuario */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {profileInfo?.type} • {profileInfo?.title}
                      </p>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-1">
                      <button
                        onClick={goToProfile}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Mi Perfil
                      </button>

                      <button
                        onClick={goToSettings}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Configuración
                      </button>

                      <button
                        onClick={goToHelp}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <HelpCircle className="mr-3 h-4 w-4" />
                        Ayuda
                      </button>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Cerrar dropdowns al hacer clic fuera */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationsOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;


