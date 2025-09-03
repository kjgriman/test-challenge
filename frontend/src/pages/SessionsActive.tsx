import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  Users,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface Session {
  _id: string;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  slpId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sessionType: 'therapy' | 'evaluation' | 'game';
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  notes?: string;
  goals?: string[];
  isActive: boolean;
}

const SessionsActive: React.FC = () => {
  const { token, user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'scheduled'>('all');

  // Cargar sesiones activas
  const loadActiveSessions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/sessions?status=in_progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data.sessions || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al cargar las sesiones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSessions();
  }, [token]);

  // Filtrar sesiones
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.childId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Obtener el estado de la sesión
  const getSessionStatus = (session: Session) => {
    switch (session.status) {
      case 'in_progress':
        return { text: 'En Progreso', color: 'bg-blue-100 text-blue-800', icon: Play };
      case 'scheduled':
        return { text: 'Programada', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'completed':
        return { text: 'Completada', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'cancelled':
        return { text: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  // Obtener el tipo de sesión
  const getSessionType = (sessionType: string) => {
    switch (sessionType) {
      case 'therapy':
        return { text: 'Terapia', color: 'bg-purple-100 text-purple-800' };
      case 'evaluation':
        return { text: 'Evaluación', color: 'bg-orange-100 text-orange-800' };
      case 'game':
        return { text: 'Juego', color: 'bg-green-100 text-green-800' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Cargando sesiones activas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sesiones Activas
              </h1>
              <p className="text-gray-600">
                Gestiona las sesiones que están en progreso o programadas
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadActiveSessions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </motion.button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por estudiante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de estado */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="in_progress">En Progreso</option>
                <option value="scheduled">Programadas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Lista de sesiones */}
        <div className="grid gap-6">
          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay sesiones activas
              </h3>
              <p className="text-gray-600 mb-6">
                No se encontraron sesiones en progreso o programadas.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadActiveSessions}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recargar
              </motion.button>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const statusInfo = getSessionStatus(session);
              const typeInfo = getSessionType(session.sessionType);
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4 inline mr-1" />
                          {statusInfo.text}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                          {typeInfo.text}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Estudiante */}
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {session.childId.firstName} {session.childId.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{session.childId.email}</p>
                        </div>
                      </div>

                      {/* Fecha y hora */}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {format(new Date(session.scheduledDate), 'PPP', { locale: es })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(session.scheduledDate), 'HH:mm', { locale: es })}
                          </p>
                        </div>
                      </div>

                      {/* Duración */}
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{session.duration} minutos</p>
                          <p className="text-sm text-gray-500">Duración programada</p>
                        </div>
                      </div>

                      {/* Objetivos */}
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {session.goals?.length || 0} objetivos
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.goals?.slice(0, 2).join(', ')}
                            {session.goals && session.goals.length > 2 && '...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    {session.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsActive;
