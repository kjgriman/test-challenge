import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
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
  Award,
  Star,
  Trophy
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface GameMetrics {
  _id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalPlays: number;
  averageScore: number;
  averageTime: number;
  completionRate: number;
  totalPlayers: number;
  lastPlayed?: string;
}

interface GameProgress {
  gameId: string;
  gameName: string;
  playerId: string;
  playerName: string;
  score: number;
  timeSpent: number;
  accuracy: number;
  completed: boolean;
  playedAt: string;
}

interface GameStats {
  totalGames: number;
  totalPlays: number;
  averageScore: number;
  averageTime: number;
  totalPlayers: number;
  gamesByCategory: {
    [key: string]: number;
  };
  gamesByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  topGames: GameMetrics[];
  recentActivity: GameProgress[];
}

const ReportsGames: React.FC = () => {
  const { user, token } = useAuthStore();
  const [games, setGames] = useState<GameMetrics[]>([]);
  const [progress, setProgress] = useState<GameProgress[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    totalPlays: 0,
    averageScore: 0,
    averageTime: 0,
    totalPlayers: 0,
    gamesByCategory: {},
    gamesByDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    topGames: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Cargar métricas de juegos
  const loadGameMetrics = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty })
      });

      const response = await fetch(`${BACKEND_URL}/api/reports/game-metrics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data.data.games || []);
        setStats(data.data.stats || {
          totalGames: 0,
          totalPlays: 0,
          averageScore: 0,
          averageTime: 0,
          totalPlayers: 0,
          gamesByCategory: {},
          gamesByDifficulty: {
            easy: 0,
            medium: 0,
            hard: 0
          },
          topGames: [],
          recentActivity: []
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al cargar las métricas de juegos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar progreso de juegos
  const loadGameProgress = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/reports/game-progress?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress || []);
      }
    } catch (err) {
      console.error('Error cargando progreso de juegos:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadGameMetrics();
      loadGameProgress();
    }
  }, [token, selectedPeriod, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Medio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                <h1 className="text-3xl font-bold text-gray-900">Métricas de Juegos</h1>
                <p className="text-gray-600 mt-2">
                  Análisis de rendimiento en juegos terapéuticos
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
                onClick={() => {
                  loadGameMetrics();
                  loadGameProgress();
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todas las Categorías</option>
                  {Object.keys(stats.gamesByCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dificultad</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todas las Dificultades</option>
                  <option value="easy">Fácil</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Difícil</option>
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
                    <p className="text-sm font-medium text-gray-600">Total Juegos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalGames}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Partidas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPlays}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Puntuación Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageScore)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageTime)} min</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
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
              {/* Games by Category */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Juegos por Categoría</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.gamesByCategory).map(([category, count]) => ({
                        name: category,
                        value: count
                      }))}
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

              {/* Games by Difficulty */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Juegos por Dificultad</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Fácil', value: stats.gamesByDifficulty.easy },
                    { name: 'Medio', value: stats.gamesByDifficulty.medium },
                    { name: 'Difícil', value: stats.gamesByDifficulty.hard }
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

            {/* Top Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Juegos Más Populares</h2>
                <p className="text-gray-600 mt-1">Los juegos con mayor participación</p>
              </div>
              <div className="p-6">
                {stats.topGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.topGames.map((game, index) => (
                      <div key={game._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <Gamepad2 className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{game.name}</h3>
                              <p className="text-sm text-gray-600">{game.category}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                            {getDifficultyText(game.difficulty)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{game.totalPlays}</p>
                            <p className="text-sm text-gray-600">Partidas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{Math.round(game.averageScore)}</p>
                            <p className="text-sm text-gray-600">Puntuación</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{game.totalPlayers}</p>
                            <p className="text-sm text-gray-600">Jugadores</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{Math.round(game.completionRate)}%</p>
                            <p className="text-sm text-gray-600">Completación</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay juegos para mostrar</p>
                  </div>
                )}
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
              <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente de Juegos</h2>
              <p className="text-gray-600 mt-1">Información detallada de las últimas partidas</p>
            </div>
            <div className="p-6">
              {stats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={`${activity.gameId}-${activity.playerId}-${activity.playedAt}`} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{activity.gameName}</h3>
                          <p className="text-gray-600">Jugado por {activity.playerName}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(activity.playedAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            activity.completed ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {activity.completed ? 'Completado' : 'Incompleto'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{activity.score}</p>
                          <p className="text-sm text-gray-600">Puntuación</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{activity.timeSpent} min</p>
                          <p className="text-sm text-gray-600">Tiempo</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900">{activity.accuracy}%</p>
                          <p className="text-sm text-gray-600">Precisión</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            {activity.score >= 80 ? (
                              <Star className="w-5 h-5 text-yellow-500 mr-1" />
                            ) : activity.score >= 60 ? (
                              <Award className="w-5 h-5 text-blue-500 mr-1" />
                            ) : (
                              <Activity className="w-5 h-5 text-gray-500 mr-1" />
                            )}
                            <span className="text-sm font-medium">
                              {activity.score >= 80 ? 'Excelente' : activity.score >= 60 ? 'Bueno' : 'Mejorable'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Rendimiento</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay actividad reciente para mostrar</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportsGames;
