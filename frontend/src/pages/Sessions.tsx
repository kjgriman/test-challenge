import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Play,
  Square,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CreateSessionModal from '../components/modals/CreateSessionModal';
import EditSessionModal from '../components/modals/EditSessionModal';

// Tipos
interface Session {
  _id: string;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  slpId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sessionType: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
  gamesPlayed?: number;
  accuracy?: number;
}

interface CreateSessionData {
  childId: string;
  scheduledDate: string;
  duration: number;
  sessionType: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
}

// Componente principal
const Sessions: React.FC = () => {
  const { user, token } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  
  // Filtros y búsqueda
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar sesiones
  const loadSessions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data.sessions || []);
      } else {
        setError('Error al cargar las sesiones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar sesiones
  useEffect(() => {
    let filtered = sessions;

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.childId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.childId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.sessionType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [sessions, statusFilter, searchTerm]);

  // Cargar sesiones al montar el componente
  useEffect(() => {
    loadSessions();
  }, [token]);

  // Debug: monitorear estado del modal
  useEffect(() => {
    console.log('🎭 Estado showCreateModal cambiado:', showCreateModal);
  }, [showCreateModal]);

  // Debug: verificar usuario y rol
  useEffect(() => {
    console.log('👤 Usuario actual:', user);
    console.log('🎯 Rol del usuario:', user?.role);
  }, [user]);

  // Obtener sesiones de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  // Función para iniciar sesión
  const startSession = async (sessionId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadSessions(); // Recargar sesiones
      } else {
        setError('Error al iniciar la sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  // Función para finalizar sesión
  const endSession = async (sessionId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Sesión completada',
          gamesPlayed: 0,
          accuracy: 0
        })
      });

      if (response.ok) {
        loadSessions(); // Recargar sesiones
      } else {
        setError('Error al finalizar la sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  // Función para eliminar sesión
  const deleteSession = async (sessionId: string) => {
    if (!token || !confirm('¿Estás seguro de que quieres eliminar esta sesión?')) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadSessions(); // Recargar sesiones
      } else {
        setError('Error al eliminar la sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sesiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Sesiones
              </h1>
              <p className="text-gray-600">
                Administra todas las sesiones de terapia
              </p>
            </div>
            
            {/* Botón de prueba siempre visible */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log('🔘 Botón Nueva Sesión clickeado');
                console.log('👤 Usuario:', user);
                console.log('🎯 Estado showCreateModal antes:', showCreateModal);
                setShowCreateModal(true);
                console.log('🎯 Estado showCreateModal después:', true);
                alert('¡Botón clickeado! Modal debería abrirse.');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 text-lg font-bold"
            >
              <Plus className="h-6 w-6" />
              🚨 BOTÓN DE PRUEBA 🚨
            </motion.button>
            
            {/* Botón original condicional */}
            {user?.role === 'slp' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔘 Botón Nueva Sesión clickeado');
                  console.log('👤 Usuario:', user);
                  console.log('🎯 Estado showCreateModal antes:', showCreateModal);
                  setShowCreateModal(true);
                  console.log('🎯 Estado showCreateModal después:', true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                <Plus className="h-5 w-5" />
                Nueva Sesión (SLP)
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante o tipo de sesión..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="scheduled">Programadas</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Mensaje de error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Lista de sesiones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {currentSessions.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay sesiones
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron sesiones con los filtros aplicados'
                  : 'Aún no has creado ninguna sesión'}
              </p>
            </div>
          ) : (
            <>
              {/* Header de la tabla */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div>Estudiante</div>
                  <div>Fecha y Hora</div>
                  <div>Tipo</div>
                  <div>Estado</div>
                  <div>Duración</div>
                  <div>Acciones</div>
                </div>
              </div>

              {/* Filas de sesiones */}
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {currentSessions.map((session, index) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        {/* Estudiante */}
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {session.childId.firstName} {session.childId.lastName}
                            </p>
                          </div>
                        </div>

                        {/* Fecha y Hora */}
                        <div>
                          <p className="text-sm text-gray-900">
                            {new Date(session.scheduledDate).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.scheduledDate).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Tipo */}
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {session.sessionType === 'therapy' ? 'Terapia' :
                             session.sessionType === 'evaluation' ? 'Evaluación' : 'Juego'}
                          </span>
                        </div>

                        {/* Estado */}
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </span>
                        </div>

                        {/* Duración */}
                        <div>
                          <p className="text-sm text-gray-900">
                            {session.duration || 45} min
                          </p>
                        </div>

                        {/* Acciones */}
                        {user?.role === 'slp' && (
                          <div className="flex items-center gap-2">
                            {session.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => startSession(session._id)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                                  title="Iniciar sesión"
                                >
                                  <Play className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingSession(session)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                                  title="Editar sesión"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteSession(session._id)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
                                  title="Eliminar sesión"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            
                            {session.status === 'in_progress' && (
                              <button
                                onClick={() => endSession(session._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
                                title="Finalizar sesión"
                              >
                                <Square className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>

        {/* Paginación */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modales */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadSessions();
          setShowCreateModal(false);
        }}
      />

      <EditSessionModal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        onSuccess={() => {
          loadSessions();
          setEditingSession(null);
        }}
        session={editingSession}
      />
    </div>
  );
};

export default Sessions;
