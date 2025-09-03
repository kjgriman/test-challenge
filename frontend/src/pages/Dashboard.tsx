import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Gamepad2,
  BarChart3,
  Clock,
  TrendingUp,
  Award,
  MessageSquare,
  Video,
  Plus,
  ArrowRight
} from 'lucide-react';

// Importar hooks y store
import { useUserRole, useProfileInfo, useAuthStore } from '../store/authStore';
import CreateSessionModal from '../components/modals/CreateSessionModal';

// Tipos para los datos del dashboard
interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalStudents: number;
  gamesPlayed: number;
  averageAccuracy: number;
  totalTime: number;
}

interface RecentSession {
  id: string;
  studentName: string;
  date: string;
  duration: string;
  accuracy: number;
  status: 'completed' | 'active' | 'scheduled';
}

interface UpcomingSession {
  id: string;
  studentName: string;
  date: string;
  time: string;
  type: string;
}

// Datos mock para el dashboard
const mockStats: DashboardStats = {
  totalSessions: 24,
  activeSessions: 2,
  totalStudents: 8,
  gamesPlayed: 156,
  averageAccuracy: 87,
  totalTime: 48,
};

const mockRecentSessions: RecentSession[] = [
  {
    id: '1',
    studentName: 'María González',
    date: '2024-01-15',
    duration: '45 min',
    accuracy: 92,
    status: 'completed',
  },
  {
    id: '2',
    studentName: 'Carlos Rodríguez',
    date: '2024-01-14',
    duration: '30 min',
    accuracy: 78,
    status: 'completed',
  },
  {
    id: '3',
    studentName: 'Ana Martínez',
    date: '2024-01-13',
    duration: '60 min',
    accuracy: 85,
    status: 'completed',
  },
];

const mockUpcomingSessions: UpcomingSession[] = [
  {
    id: '1',
    studentName: 'Luis Pérez',
    date: '2024-01-16',
    time: '10:00 AM',
    type: 'Terapia del Habla',
  },
  {
    id: '2',
    studentName: 'Sofia López',
    date: '2024-01-16',
    time: '2:00 PM',
    type: 'Juego Interactivo',
  },
  {
    id: '3',
    studentName: 'Diego Silva',
    date: '2024-01-17',
    time: '9:00 AM',
    type: 'Evaluación',
  },
];

// Componente principal de Dashboard
const Dashboard: React.FC = () => {
  const userRole = useUserRole();
  const profileInfo = useProfileInfo();
  const { token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>(mockRecentSessions);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(mockUpcomingSessions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      
      // Cargar estadísticas
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
      
      // Cargar sesiones recientes
      const recentResponse = await fetch('/api/dashboard/recent-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentSessions(recentData.data);
      }
      
      // Cargar próximas sesiones
      const upcomingResponse = await fetch('/api/dashboard/upcoming-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();
        setUpcomingSessions(upcomingData.data);
      }
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setError('Error cargando datos del dashboard. Usando datos de ejemplo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Función para obtener el color del estado de la sesión
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'active':
        return 'bg-primary-100 text-primary-800';
      case 'scheduled':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'active':
        return 'Activa';
      case 'scheduled':
        return 'Programada';
      default:
        return 'Desconocido';
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header del Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-soft p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="text-gray-600 mt-2">
              {profileInfo?.title || 'Usuario'} • {profileInfo?.type || 'Rol'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              className="btn-primary"
              onClick={() => {
                console.log('🔘 Botón Nueva Sesión del Dashboard clickeado');
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sesión
            </button>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total de Sesiones */}
        <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1 text-success-500" />
            <span>+12% este mes</span>
          </div>
        </div>

        {/* Sesiones Activas */}
        <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-success-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <Video className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1 text-success-500" />
            <span>En tiempo real</span>
          </div>
        </div>

        {/* Total de Estudiantes */}
        <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-secondary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estudiantes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-full">
              <Users className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1 text-success-500" />
            <span>+2 este mes</span>
          </div>
        </div>

        {/* Precisión Promedio */}
        <div className="bg-white rounded-xl shadow-soft p-6 border-l-4 border-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Precisión Promedio</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageAccuracy}%</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <Award className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1 text-success-500" />
            <span>+5% este mes</span>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal del dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sesiones Recientes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Sesiones Recientes</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.studentName}</p>
                    <p className="text-sm text-gray-500">{formatDate(session.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Duración</p>
                    <p className="font-medium text-gray-900">{session.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Precisión</p>
                    <p className="font-medium text-gray-900">{session.accuracy}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Próximas Sesiones */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-soft p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Próximas Sesiones</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              Ver todas
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{session.studentName}</h3>
                  <span className="text-xs text-gray-500">{session.time}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{session.type}</p>
                <p className="text-xs text-gray-500">{formatDate(session.date)}</p>
              </motion.div>
            ))}
          </div>

          {/* Botón para programar nueva sesión */}
          <button className="w-full mt-4 btn-outline">
            <Plus className="w-4 h-4 mr-2" />
            Programar Sesión
          </button>
        </motion.div>
      </div>

      {/* Acciones rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-soft p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200 text-left">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900">Iniciar Sesión</h3>
            <p className="text-sm text-gray-600">Comenzar terapia virtual</p>
          </button>

          <button className="p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors duration-200 text-left">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mb-3">
              <Gamepad2 className="w-5 h-5 text-success-600" />
            </div>
            <h3 className="font-medium text-gray-900">Crear Juego</h3>
            <p className="text-sm text-gray-600">Diseñar actividad interactiva</p>
          </button>

          <button className="p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors duration-200 text-left">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-secondary-600" />
            </div>
            <h3 className="font-medium text-gray-900">Agregar Estudiante</h3>
            <p className="text-sm text-gray-600">Registrar nuevo paciente</p>
          </button>

          <button className="p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors duration-200 text-left">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-warning-600" />
            </div>
            <h3 className="font-medium text-gray-900">Ver Reportes</h3>
            <p className="text-sm text-gray-600">Analizar progreso</p>
          </button>
        </div>
      </motion.div>

               {/* Modal para crear nueva sesión */}
         <CreateSessionModal
           isOpen={showCreateModal}
           onClose={() => setShowCreateModal(false)}
           onSuccess={() => {
             loadDashboardData(); // Recargar datos del dashboard
             setShowCreateModal(false);
           }}
         />
    </div>
  );
};

export default Dashboard;


