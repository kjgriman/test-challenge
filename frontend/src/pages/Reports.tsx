import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Gamepad2,
  TrendingUp,
  Users,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  PieChart,
  Activity,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ReportStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageDuration: number;
  totalStudents: number;
  gamesPlayed: number;
  averageAccuracy: number;
  totalHours: number;
}

interface RecentActivity {
  id: string;
  type: 'session' | 'game' | 'evaluation';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in_progress' | 'cancelled';
}

const Reports: React.FC = () => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<ReportStats>({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    averageDuration: 0,
    totalStudents: 0,
    gamesPlayed: 0,
    averageAccuracy: 0,
    totalHours: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Cargar estadísticas generales
  const loadStats = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/api/reports/stats?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats || {
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          averageDuration: 0,
          totalStudents: 0,
          gamesPlayed: 0,
          averageAccuracy: 0,
          totalHours: 0
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al cargar las estadísticas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar actividad reciente
  const loadRecentActivity = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.data.activities || []);
      }
    } catch (err) {
      console.error('Error cargando actividad reciente:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadStats();
      loadRecentActivity();
    }
  }, [token, selectedPeriod]);

  const reportCards = [
    {
      title: 'Progreso General',
      description: 'Análisis completo del progreso de todos los estudiantes',
      icon: BarChart3,
      href: '/reports/progress',
      color: 'bg-blue-500',
      stats: `${stats.totalStudents} estudiantes`
    },
    {
      title: 'Sesiones por Estudiante',
      description: 'Reporte detallado de sesiones por estudiante',
      icon: Calendar,
      href: '/reports/sessions',
      color: 'bg-green-500',
      stats: `${stats.totalSessions} sesiones`
    },
    {
      title: 'Métricas de Juegos',
      description: 'Análisis de rendimiento en juegos terapéuticos',
      icon: Gamepad2,
      href: '/reports/games',
      color: 'bg-purple-500',
      stats: `${stats.gamesPlayed} juegos`
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
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
      default:
        return status;
    }
  };

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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
              <p className="text-gray-600 mt-2">
                Análisis completo y métricas de tu terapia del habla
              </p>
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
                onClick={() => {
                  loadStats();
                  loadRecentActivity();
                }}
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
                <p className="text-sm font-medium text-gray-600">Sesiones Completadas</p>
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

        {/* Report Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {reportCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = card.href}
            >
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mr-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.stats}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{card.description}</p>
              <div className="flex items-center text-primary-600 font-medium text-sm">
                Ver Reporte
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
            <p className="text-gray-600 mt-1">Últimas actividades y sesiones</p>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                        {activity.type === 'session' && <Calendar className="w-5 h-5 text-primary-600" />}
                        {activity.type === 'game' && <Gamepad2 className="w-5 h-5 text-primary-600" />}
                        {activity.type === 'evaluation' && <FileText className="w-5 h-5 text-primary-600" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(activity.date), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
