import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Clock,
  Users,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  TrendingUp,
  FileText
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
  accuracy?: number;
  gamesPlayed?: number;
}

const SessionsHistory: React.FC = () => {
  const { token, user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [filterType, setFilterType] = useState<'all' | 'therapy' | 'evaluation' | 'game'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Cargar historial de sesiones
  const loadSessionHistory = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar todas las sesiones (el filtro se hace en el frontend)
      const response = await fetch(`${BACKEND_URL}/sessions`, {
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
        setError(errorData.error?.message || 'Error al cargar el historial');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionHistory();
  }, [token]);

  // Filtrar sesiones
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.childId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesType = filterType === 'all' || session.sessionType === filterType;

    // Filtrar por rango de fechas
    const sessionDate = new Date(session.scheduledDate);
    const now = new Date();
    let dateFilter = true;

    switch (dateRange) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = sessionDate >= weekAgo;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = sessionDate >= monthAgo;
        break;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFilter = sessionDate >= quarterAgo;
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = sessionDate >= yearAgo;
        break;
    }

    return matchesSearch && matchesStatus && matchesType && dateFilter;
  });

  // Calcular estadísticas
  const stats = {
    total: filteredSessions.length,
    completed: filteredSessions.filter(s => s.status === 'completed').length,
    cancelled: filteredSessions.filter(s => s.status === 'cancelled').length,
    therapy: filteredSessions.filter(s => s.sessionType === 'therapy').length,
    evaluation: filteredSessions.filter(s => s.sessionType === 'evaluation').length,
    game: filteredSessions.filter(s => s.sessionType === 'game').length,
    avgAccuracy: filteredSessions
      .filter(s => s.accuracy !== undefined)
      .reduce((sum, s) => sum + (s.accuracy || 0), 0) / 
      filteredSessions.filter(s => s.accuracy !== undefined).length || 0,
    totalDuration: filteredSessions.reduce((sum, s) => sum + s.duration, 0)
  };

  // Obtener el estado de la sesión
  const getSessionStatus = (session: Session) => {
    switch (session.status) {
      case 'completed':
        return { text: 'Completada', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'cancelled':
        return { text: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'in_progress':
        return { text: 'En Progreso', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'scheduled':
        return { text: 'Programada', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
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
          <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-lg text-gray-600">Cargando historial...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Historial de Sesiones
              </h1>
              <p className="text-gray-600">
                Revisa el historial completo de todas las sesiones
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadSessionHistory}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </motion.button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <History className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precisión Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgAccuracy.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Total</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalDuration}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de estado */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            {/* Filtro de tipo */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="therapy">Terapia</option>
                <option value="evaluation">Evaluación</option>
                <option value="game">Juego</option>
              </select>
            </div>

            {/* Rango de fechas */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
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
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay sesiones en el historial
              </h3>
              <p className="text-gray-600 mb-6">
                No se encontraron sesiones con los filtros aplicados.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadSessionHistory}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
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
                        <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
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

                      {/* Duración y precisión */}
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{session.duration} minutos</p>
                          <p className="text-sm text-gray-500">
                            Precisión: {session.accuracy || 0}%
                          </p>
                        </div>
                      </div>

                      {/* Juegos jugados */}
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {session.gamesPlayed || 0} juegos
                          </p>
                          <p className="text-sm text-gray-500">
                            {session.goals?.length || 0} objetivos
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    {session.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Notas</span>
                        </div>
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

export default SessionsHistory;
