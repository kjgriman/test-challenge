import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Target,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface SessionReport {
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
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sessionType: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
  accuracy?: number;
  gamesPlayed?: number;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  inProgressSessions: number;
  averageDuration: number;
  averageAccuracy: number;
  totalHours: number;
  sessionsByType: {
    therapy: number;
    evaluation: number;
    game: number;
  };
  sessionsByStatus: {
    scheduled: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
}

const ReportsSessions: React.FC = () => {
  const { user, token } = useAuthStore();
  const [sessions, setSessions] = useState<SessionReport[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    inProgressSessions: 0,
    averageDuration: 0,
    averageAccuracy: 0,
    totalHours: 0,
    sessionsByType: {
      therapy: 0,
      evaluation: 0,
      game: 0
    },
    sessionsByStatus: {
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Cargar sesiones
  const loadSessions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedStudent !== 'all' && { studentId: selectedStudent }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedType !== 'all' && { type: selectedType })
      });

      const response = await fetch(`${BACKEND_URL}/api/reports/sessions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data.sessions || []);
        setStats(data.data.stats || {
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          inProgressSessions: 0,
          averageDuration: 0,
          averageAccuracy: 0,
          totalHours: 0,
          sessionsByType: {
            therapy: 0,
            evaluation: 0,
            game: 0
          },
          sessionsByStatus: {
            scheduled: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0
          }
        });
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
    if (token) {
      loadSessions();
    }
  }, [token, selectedPeriod, selectedStudent, selectedStatus, selectedType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En Progreso';
      case 'cancelled':
        return 'Cancelada';
      case 'scheduled':
        return 'Programada';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'therapy':
        return 'Terapia';
      case 'evaluation':
        return 'Evaluación';
      case 'game':
        return 'Juego';
      default:
        return type;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sesiones por Estudiante</h1>
                <p className="text-gray-600 mt-2">
                  Reporte detallado de sesiones por estudiante
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
              </select>
              <button
                onClick={() => loadSessions()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos los Estudiantes</option>
                  {Array.from(new Set(sessions.map(s => s.childId._id))).map((studentId) => {
                    const session = sessions.find(s => s.childId._id === studentId);
                    return (
                      <option key={studentId} value={studentId}>
                        {session?.childId.firstName} {session?.childId.lastName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="scheduled">Programadas</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos los Tipos</option>
                  <option value="therapy">Terapia</option>
                  <option value="evaluation">Evaluación</option>
                  <option value="game">Juego</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vista</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      viewMode === 'overview'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Detallada
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {viewMode === 'overview' ? (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Promedio Duración</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageDuration)} min</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Precisión Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageAccuracy}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {/* Sessions by Type */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sesiones por Tipo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Terapia', value: stats.sessionsByType.therapy },
                        { name: 'Evaluación', value: stats.sessionsByType.evaluation },
                        { name: 'Juego', value: stats.sessionsByType.game }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sessions by Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sesiones por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Programadas', value: stats.sessionsByStatus.scheduled },
                    { name: 'En Progreso', value: stats.sessionsByStatus.in_progress },
                    { name: 'Completadas', value: stats.sessionsByStatus.completed },
                    { name: 'Canceladas', value: stats.sessionsByStatus.cancelled }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        ) : (
          /* Detailed View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Lista Detallada de Sesiones</h2>
              <p className="text-gray-600 mt-1">Información completa de todas las sesiones</p>
            </div>
            <div className="p-6">
              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session._id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {session.childId.firstName} {session.childId.lastName}
                          </h3>
                          <p className="text-gray-600">{session.childId.email}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(session.scheduledDate), 'dd MMM yyyy, HH:mm', { locale: es })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {getTypeText(session.sessionType)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{session.duration} min</p>
                          <p className="text-sm text-gray-600">Duración</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{session.accuracy || 0}%</p>
                          <p className="text-sm text-gray-600">Precisión</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{session.gamesPlayed || 0}</p>
                          <p className="text-sm text-gray-600">Juegos Jugados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">
                            {session.slpId.firstName} {session.slpId.lastName}
                          </p>
                          <p className="text-sm text-gray-600">Terapeuta</p>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay sesiones para mostrar</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportsSessions;
