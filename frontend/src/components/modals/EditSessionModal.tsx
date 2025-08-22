import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Users,
  Target,
  FileText,
  Save,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// Tipos
interface Session {
  _id: string;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  slpId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  sessionType: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
  gamesPlayed?: number;
  accuracy?: number;
}

interface EditSessionData {
  scheduledDate: string;
  duration: number;
  sessionType: 'therapy' | 'evaluation' | 'game';
  notes?: string;
  goals?: string[];
}

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session: Session | null;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  session
}) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del formulario
  const [formData, setFormData] = useState<EditSessionData>({
    scheduledDate: '',
    duration: 45,
    sessionType: 'therapy',
    notes: '',
    goals: []
  });

  const [goalInput, setGoalInput] = useState('');

  // Cargar datos de la sesión cuando se abre el modal
  useEffect(() => {
    if (isOpen && session) {
      setFormData({
        scheduledDate: session.scheduledDate.split('T')[0],
        duration: session.duration || 45,
        sessionType: session.sessionType,
        notes: session.notes || '',
        goals: [...(session.goals || [])]
      });
      setGoalInput('');
      setError(null);
    }
  }, [isOpen, session]);

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof EditSessionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Agregar objetivo
  const addGoal = () => {
    if (goalInput.trim() && !formData.goals!.includes(goalInput.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...(prev.goals || []), goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  // Remover objetivo
  const removeGoal = (goalToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals!.filter(goal => goal !== goalToRemove)
    }));
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !session) return;

    // Validaciones
    if (!formData.scheduledDate) {
      setError('Debes seleccionar una fecha');
      return;
    }

    if (formData.duration < 15 || formData.duration > 180) {
      setError('La duración debe estar entre 15 y 180 minutos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/sessions/${session._id}`, {
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
        setError(errorData.error?.message || 'Error al actualizar la sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

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
                  <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Editar Sesión
                    </h2>
                    <p className="text-sm text-gray-500">
                      {session.childId.firstName} {session.childId.lastName}
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
                      <span className="text-gray-500">Estudiante:</span>
                      <p className="font-medium">{session.childId.firstName} {session.childId.lastName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <p className="font-medium capitalize">{session.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">ID de Sesión:</span>
                      <p className="font-medium text-xs">{session._id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Juegos jugados:</span>
                      <p className="font-medium">{session.gamesPlayed || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Información editable */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Detalles de la Sesión
                  </h3>
                  
                  {/* Fecha y Duración */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Duración (minutos) *
                      </label>
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Tipo de Sesión */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Sesión
                    </label>
                    <select
                      value={formData.sessionType}
                      onChange={(e) => handleInputChange('sessionType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="therapy">Terapia</option>
                      <option value="evaluation">Evaluación</option>
                      <option value="game">Juego</option>
                    </select>
                  </div>
                </div>

                {/* Objetivos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <Target className="h-5 w-5 inline mr-2" />
                    Objetivos de la Sesión
                  </h3>
                  
                  {/* Input para agregar objetivos */}
                  <div className="flex gap-2">
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
                  {formData.goals && formData.goals.length > 0 && (
                    <div className="space-y-2">
                      {formData.goals.map((goal, index) => (
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
                    placeholder="Notas o comentarios sobre la sesión"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
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

export default EditSessionModal;
