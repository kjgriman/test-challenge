import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  TrendingUp,
  Clock,
  Target,
  Calendar,
  Award,
  Brain,
  BarChart3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Tipos
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  child: {
    parentEmail: string;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    primaryGoals: string[];
    sessionsCompleted: number;
    totalSessionTime: number;
    notes?: string;
  };
}

interface ProgressData {
  weeklyProgress: {
    week: string;
    sessionsCompleted: number;
    totalTime: number;
    averageAccuracy: number;
  }[];
  monthlyProgress: {
    month: string;
    sessionsCompleted: number;
    totalTime: number;
    averageAccuracy: number;
  }[];
  goalProgress: {
    goal: string;
    completionPercentage: number;
    sessionsWorked: number;
  }[];
  recentSessions: {
    _id: string;
    date: string;
    duration: number;
    accuracy: number;
    gamesPlayed: number;
    status: string;
  }[];
  skillImprovements: {
    skill: string;
    previousLevel: number;
    currentLevel: number;
    improvement: number;
  }[];
}

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentProgressModal: React.FC<StudentProgressModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'goals' | 'skills'>('overview');

  // Cargar datos de progreso
  useEffect(() => {
    if (isOpen && student && token) {
      loadProgressData();
    }
  }, [isOpen, student, token]);

  const loadProgressData = async () => {
    if (!student || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/students/${student._id}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgressData(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al cargar el progreso');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear tiempo
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Obtener color del nivel de habilidad
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener nombre del nivel de habilidad
  const getSkillLevelName = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return level;
    }
  };

  if (!student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Progreso del Estudiante
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        {student.firstName} {student.lastName}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(student.child.skillLevel)}`}>
                        {getSkillLevelName(student.child.skillLevel)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Resumen', icon: BarChart3 },
                    { id: 'sessions', label: 'Sesiones', icon: Calendar },
                    { id: 'goals', label: 'Objetivos', icon: Target },
                    { id: 'skills', label: 'Habilidades', icon: Brain }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Contenido */}
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Cargando progreso...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12 text-red-600">
                    <AlertCircle className="h-8 w-8 mr-3" />
                    <span>{error}</span>
                  </div>
                ) : progressData ? (
                  <>
                    {/* Tab: Resumen */}
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Estadísticas principales */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <Calendar className="h-8 w-8 text-blue-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-blue-900">Sesiones</p>
                                <p className="text-2xl font-bold text-blue-600">{student.child.sessionsCompleted}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="h-8 w-8 text-green-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-green-900">Tiempo Total</p>
                                <p className="text-2xl font-bold text-green-600">
                                  {formatTime(student.child.totalSessionTime)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <Award className="h-8 w-8 text-purple-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-purple-900">Precisión</p>
                                <p className="text-2xl font-bold text-purple-600">0%</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 rounded-lg p-4">
                            <div className="flex items-center">
                              <Target className="h-8 w-8 text-orange-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-orange-900">Objetivos</p>
                                <p className="text-2xl font-bold text-orange-600">{student.child.primaryGoals.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progreso semanal */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Progreso Semanal
                          </h3>
                          {progressData.weeklyProgress.length > 0 ? (
                            <div className="space-y-3">
                              {progressData.weeklyProgress.slice(-4).map((week, index) => (
                                <div key={index} className="flex items-center justify-between py-2">
                                  <span className="text-sm font-medium text-gray-700">{week.week}</span>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-blue-600">{week.sessionsCompleted} sesiones</span>
                                    <span className="text-green-600">{formatTime(week.totalTime)}</span>
                                    <span className="text-purple-600">{week.averageAccuracy}% precisión</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No hay datos de progreso semanal disponibles
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab: Sesiones */}
                    {activeTab === 'sessions' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Sesiones Recientes
                        </h3>
                        {progressData.recentSessions.length > 0 ? (
                          <div className="space-y-3">
                            {progressData.recentSessions.map((session) => (
                              <div key={session._id} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Sesión - {formatDate(session.date)}
                                    </p>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                      <span><Clock className="h-4 w-4 inline mr-1" />{formatTime(session.duration)}</span>
                                      <span><Award className="h-4 w-4 inline mr-1" />{session.accuracy}%</span>
                                      <span><Brain className="h-4 w-4 inline mr-1" />{session.gamesPlayed} juegos</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      session.status === 'completed' 
                                        ? 'bg-green-100 text-green-800'
                                        : session.status === 'scheduled'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {session.status === 'completed' ? 'Completada' :
                                       session.status === 'scheduled' ? 'Programada' : session.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No hay sesiones recientes disponibles
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tab: Objetivos */}
                    {activeTab === 'goals' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Progreso de Objetivos
                        </h3>
                        {progressData.goalProgress.length > 0 ? (
                          <div className="space-y-4">
                            {progressData.goalProgress.map((goal, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                                  <span className="text-sm font-medium text-blue-600">
                                    {goal.completionPercentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${goal.completionPercentage}%` }}
                                  />
                                </div>
                                <p className="text-sm text-gray-600">
                                  {goal.sessionsWorked} sesiones trabajadas en este objetivo
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No hay datos de progreso de objetivos disponibles
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tab: Habilidades */}
                    {activeTab === 'skills' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Mejoras en Habilidades
                        </h3>
                        {progressData.skillImprovements.length > 0 ? (
                          <div className="space-y-4">
                            {progressData.skillImprovements.map((skill, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                      {skill.previousLevel}% → {skill.currentLevel}%
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      skill.improvement > 0
                                        ? 'bg-green-100 text-green-800'
                                        : skill.improvement < 0
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {skill.improvement > 0 ? '+' : ''}{skill.improvement}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            No hay datos de mejoras en habilidades disponibles
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay datos de progreso disponibles</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StudentProgressModal;
