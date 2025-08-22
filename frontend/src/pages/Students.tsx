import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Award,
  Clock,
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CreateStudentModal from '../components/modals/CreateStudentModal';
import EditStudentModal from '../components/modals/EditStudentModal';
import StudentProgressModal from '../components/modals/StudentProgressModal';

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



// Componente principal
const Students: React.FC = () => {
  const { user, token } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingProgress, setViewingProgress] = useState<Student | null>(null);
  
  // Filtros y búsqueda
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar estudiantes
  const loadStudents = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data.students || []);
      } else {
        setError('Error al cargar los estudiantes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar estudiantes
  useEffect(() => {
    let filtered = students;

    // Filtro por nivel de habilidad
    if (skillLevelFilter !== 'all') {
      filtered = filtered.filter(student => student.child.skillLevel === skillLevelFilter);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.child.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, skillLevelFilter, searchTerm]);

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    if (user?.role === 'slp') {
      loadStudents();
    }
  }, [token, user]);

  // Obtener estudiantes de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Función para eliminar estudiante
  const deleteStudent = async (studentId: string) => {
    if (!token || !confirm('¿Estás seguro de que quieres eliminar este estudiante?')) return;

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadStudents(); // Recargar estudiantes
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al eliminar el estudiante');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  // Función para obtener color del nivel de habilidad
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

  // Función para obtener texto del nivel de habilidad
  const getSkillLevelText = (level: string) => {
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

  // Solo mostrar a SLP
  if (user?.role !== 'slp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">Solo los terapeutas pueden acceder a la gestión de estudiantes</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estudiantes...</p>
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
                Gestión de Estudiantes
              </h1>
              <p className="text-gray-600">
                Administra tu caseload de estudiantes
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
              Nuevo Estudiante
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
                <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Principiantes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.child.skillLevel === 'beginner').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Intermedios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.child.skillLevel === 'intermediate').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avanzados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.child.skillLevel === 'advanced').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o email del padre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por nivel */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={skillLevelFilter}
                onChange={(e) => setSkillLevelFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los niveles</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
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
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 underline"
            >
              Cerrar
            </button>
          </motion.div>
        )}

        {/* Lista de estudiantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {currentStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay estudiantes
              </h3>
              <p className="text-gray-600">
                {searchTerm || skillLevelFilter !== 'all' 
                  ? 'No se encontraron estudiantes con los filtros aplicados'
                  : 'Aún no has agregado ningún estudiante a tu caseload'}
              </p>
            </div>
          ) : (
            <>
              {/* Header de la tabla */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div>Estudiante</div>
                  <div>Email del Padre</div>
                  <div>Nivel</div>
                  <div>Sesiones</div>
                  <div>Tiempo Total</div>
                  <div>Acciones</div>
                </div>
              </div>

              {/* Filas de estudiantes */}
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {currentStudents.map((student, index) => (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                        {/* Estudiante */}
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        {/* Email del padre */}
                        <div>
                          <p className="text-sm text-gray-900">
                            {student.child.parentEmail}
                          </p>
                        </div>

                        {/* Nivel */}
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(student.child.skillLevel)}`}>
                            {getSkillLevelText(student.child.skillLevel)}
                          </span>
                        </div>

                        {/* Sesiones completadas */}
                        <div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <p className="text-sm text-gray-900">
                              {student.child.sessionsCompleted}
                            </p>
                          </div>
                        </div>

                        {/* Tiempo total */}
                        <div>
                          <p className="text-sm text-gray-900">
                            {Math.round(student.child.totalSessionTime)} min
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingProgress(student)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-150"
                            title="Ver progreso"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                            title="Editar estudiante"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteStudent(student._id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
                            title="Eliminar estudiante"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Objetivos principales */}
                      {student.child.primaryGoals && student.child.primaryGoals.length > 0 && (
                        <div className="mt-3 lg:col-span-6">
                          <div className="flex flex-wrap gap-1">
                            {student.child.primaryGoals.slice(0, 3).map((goal, goalIndex) => (
                              <span
                                key={goalIndex}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {goal}
                              </span>
                            ))}
                            {student.child.primaryGoals.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                +{student.child.primaryGoals.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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
            transition={{ delay: 0.4 }}
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
      <CreateStudentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadStudents();
          setShowCreateModal(false);
        }}
      />

      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={() => {
          loadStudents();
          setEditingStudent(null);
        }}
        student={editingStudent}
      />

      <StudentProgressModal
        isOpen={!!viewingProgress}
        onClose={() => setViewingProgress(null)}
        student={viewingProgress}
      />
    </div>
  );
};

export default Students;
