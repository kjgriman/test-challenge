import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  Target,
  AlertCircle,
  Play,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
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
  duration: number;
  notes?: string;
  goals?: string[];
}

const SessionsScheduled: React.FC = () => {
  const { token, user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'therapy' | 'evaluation' | 'game'>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Cargar sesiones programadas
  const loadScheduledSessions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/sessions?status=scheduled`, {
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
    loadScheduledSessions();
  }, [token]);

  // Obtener días de la semana actual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Domingo
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filtrar sesiones
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.childId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || session.sessionType === filterType;

    return matchesSearch && matchesType;
  });

  // Obtener sesiones por día
  const getSessionsForDay = (date: Date) => {
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return format(sessionDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  // Obtener el tipo de sesión
  const getSessionType = (sessionType: string) => {
    switch (sessionType) {
      case 'therapy':
        return { text: 'Terapia', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50' };
      case 'evaluation':
        return { text: 'Evaluación', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50' };
      case 'game':
        return { text: 'Juego', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-800', bgColor: 'bg-gray-50' };
    }
  };

  // Navegar semanas
  const goToPreviousWeek = () => {
    setCurrentWeek(subDays(currentWeek, 7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Cargando sesiones programadas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sesiones Programadas
              </h1>
              <p className="text-gray-600">
                Vista semanal de las sesiones programadas
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadScheduledSessions}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de tipo */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="therapy">Terapia</option>
                <option value="evaluation">Evaluación</option>
                <option value="game">Juego</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navegación de semanas */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousWeek}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {format(weekStart, 'PPP', { locale: es })} - {format(weekEnd, 'PPP', { locale: es })}
              </h2>
              <button
                onClick={goToNextWeek}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={goToCurrentWeek}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Esta semana
            </button>
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

        {/* Vista semanal */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const daySessions = getSessionsForDay(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={day.toString()}
                className={`bg-white rounded-xl shadow-sm p-4 ${
                  isToday ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* Header del día */}
                <div className="text-center mb-4">
                  <div className={`text-sm font-medium ${
                    format(day, 'EEEE', { locale: es }) === 'domingo' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {format(day, 'EEEE', { locale: es })}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isToday ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(day, 'MMM', { locale: es })}
                  </div>
                </div>

                {/* Sesiones del día */}
                <div className="space-y-2">
                  {daySessions.length === 0 ? (
                    <div className="text-center py-4">
                      <CalendarDays className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Sin sesiones</p>
                    </div>
                  ) : (
                    daySessions.map((session) => {
                      const typeInfo = getSessionType(session.sessionType);
                      
                      return (
                        <motion.div
                          key={session._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-3 rounded-lg ${typeInfo.bgColor} border border-gray-200`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
                              {typeInfo.text}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(session.scheduledDate), 'HH:mm', { locale: es })}
                            </div>
                          </div>
                          
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {session.childId.firstName} {session.childId.lastName}
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">
                            {session.duration} min
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button className="p-1 text-gray-400 hover:text-green-600 rounded">
                              <Play className="h-3 w-3" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-blue-600 rounded">
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la semana</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredSessions.filter(s => s.sessionType === 'therapy').length}
              </div>
              <div className="text-sm text-purple-700">Terapias</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredSessions.filter(s => s.sessionType === 'evaluation').length}
              </div>
              <div className="text-sm text-orange-700">Evaluaciones</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredSessions.filter(s => s.sessionType === 'game').length}
              </div>
              <div className="text-sm text-green-700">Juegos</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredSessions.length}
              </div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsScheduled;
