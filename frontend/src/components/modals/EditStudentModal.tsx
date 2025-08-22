import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Users,
  Target,
  FileText,
  Save,
  Loader2,
  AlertTriangle
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

interface EditStudentData {
  firstName: string;
  lastName: string;
  parentEmail: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[];
  notes?: string;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student | null;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  student
}) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState<EditStudentData>({
    firstName: '',
    lastName: '',
    parentEmail: '',
    skillLevel: 'beginner',
    primaryGoals: [],
    notes: ''
  });

  const [goalInput, setGoalInput] = useState('');

  // Cargar datos del estudiante cuando se abre el modal
  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        parentEmail: student.child.parentEmail,
        skillLevel: student.child.skillLevel,
        primaryGoals: [...student.child.primaryGoals],
        notes: student.child.notes || ''
      });
      setGoalInput('');
      setError(null);
    }
  }, [isOpen, student]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof EditStudentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Agregar objetivo
  const addGoal = () => {
    if (goalInput.trim() && !formData.primaryGoals.includes(goalInput.trim())) {
      setFormData(prev => ({
        ...prev,
        primaryGoals: [...prev.primaryGoals, goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  // Remover objetivo
  const removeGoal = (goalToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.filter(goal => goal !== goalToRemove)
    }));
  };

  // Validar email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !student) return;

    // Validaciones
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return;
    }

    if (!formData.parentEmail.trim()) {
      setError('El email del padre es requerido');
      return;
    }

    if (!isValidEmail(formData.parentEmail)) {
      setError('El email del padre no es válido');
      return;
    }

    if (formData.primaryGoals.length === 0) {
      setError('Agrega al menos un objetivo principal');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/students/${student._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al actualizar el estudiante');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
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
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Editar Estudiante
                    </h2>
                    <p className="text-sm text-gray-500">
                      {student.firstName} {student.lastName} ({student.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Contenido */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Información no editable */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Información del Sistema
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium">{student.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Sesiones completadas:</span>
                      <p className="font-medium">{student.child.sessionsCompleted}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tiempo total:</span>
                      <p className="font-medium">{Math.round(student.child.totalSessionTime / 60)} horas</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email del padre:</span>
                      <p className="font-medium">{student.child.parentEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre del estudiante"
                        required
                      />
                    </div>

                    {/* Apellido */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Apellido del estudiante"
                        required
                      />
                    </div>
                  </div>

                  {/* Email del padre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del Padre/Tutor *
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@padre.com"
                      required
                    />
                  </div>
                </div>

                {/* Información Académica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Información Académica
                  </h3>

                  {/* Nivel de Habilidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Habilidad
                    </label>
                    <select
                      value={formData.skillLevel}
                      onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>

                  {/* Objetivos Principales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Target className="h-4 w-4 inline mr-1" />
                      Objetivos Principales *
                    </label>
                    
                    {/* Input para agregar objetivos */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                        placeholder="Escribir objetivo y presionar Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addGoal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>

                    {/* Lista de objetivos */}
                    {formData.primaryGoals.length > 0 && (
                      <div className="space-y-2">
                        {formData.primaryGoals.map((goal, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg"
                          >
                            <span className="text-sm text-blue-900">{goal}</span>
                            <button
                              type="button"
                              onClick={() => removeGoal(goal)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Notas Adicionales
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      placeholder="Información adicional sobre el estudiante"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditStudentModal;
