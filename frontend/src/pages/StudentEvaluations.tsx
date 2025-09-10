import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Calendar,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Tipos simplificados
interface Evaluation {
  _id: string;
  title: string;
  description: string;
  evaluationType: 'initial' | 'progress' | 'final' | 'specific';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  overallScore: number;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Componente principal
const StudentEvaluations: React.FC = () => {
  const navigate = useNavigate();
  const { apiRequest } = useAuthStore();
  
  // Estado del componente
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar evaluaciones
  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/evaluations', 'GET');

      if (response.success) {
        setEvaluations(response.data.evaluations || []);
      } else {
        setError('Error al cargar las evaluaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estudiantes
  const loadStudents = async () => {
    try {
      const response = await apiRequest('/students', 'GET');
      if (response.success) {
        setStudents(response.data.students || []);
      }
    } catch (err) {
      console.error('Error cargando estudiantes:', err);
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    loadEvaluations();
    loadStudents();
  }, []);

  // Filtrar evaluaciones
  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesStudent = selectedStudent === 'all' || evaluation.studentId._id === selectedStudent;
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;
    const matchesSearch = !searchTerm || 
      evaluation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.studentId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.studentId.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStudent && matchesStatus && matchesSearch;
  });

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Función para obtener texto del tipo
  const getTypeText = (type: string) => {
    switch (type) {
      case 'initial': return 'Inicial';
      case 'progress': return 'Progreso';
      case 'final': return 'Final';
      case 'specific': return 'Específica';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/students')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
                  <p className="text-gray-600">Gestiona las evaluaciones de tus estudiantes</p>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/evaluations/create')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
              Nueva Evaluación
            </motion.button>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
        >
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-bold text-gray-900">{evaluations.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluations.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluations.filter(e => e.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluations.filter(e => e.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar evaluaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Filtro por estudiante */}
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Todos los estudiantes</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </motion.div>

        {/* Lista de evaluaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm"
        >
          {filteredEvaluations.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones</h3>
              <p className="text-gray-600 mb-6">
                {evaluations.length === 0
                  ? 'Comienza creando tu primera evaluación'
                  : 'No se encontraron evaluaciones con los filtros aplicados'
                }
              </p>
              <button
                onClick={() => navigate('/evaluations/create')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="h-5 w-5" />
                Nueva Evaluación
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Evaluación</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Estudiante</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Puntaje</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredEvaluations.map((evaluation, index) => (
                      <motion.tr
                        key={evaluation._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{evaluation.title}</div>
                            {evaluation.description && (
                              <div className="text-sm text-gray-600 mt-1">{evaluation.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {evaluation.studentId.firstName} {evaluation.studentId.lastName}
                              </div>
                              <div className="text-sm text-gray-600">{evaluation.studentId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {getTypeText(evaluation.evaluationType)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(evaluation.status)}`}>
                            {getStatusText(evaluation.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(evaluation.scheduledDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(evaluation.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {evaluation.status === 'completed' ? (
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {evaluation.overallScore}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/evaluations/${evaluation._id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => navigate(`/evaluations/${evaluation._id}/edit`)}
                              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Editar evaluación"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentEvaluations;