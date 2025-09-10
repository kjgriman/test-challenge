import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Users,
  Target,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Tipos
interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  parentEmail: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[];
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

// Opciones para objetivos primarios
const PRIMARY_GOALS_OPTIONS = [
  { value: 'articulation', label: 'Articulación' },
  { value: 'language', label: 'Lenguaje' },
  { value: 'fluency', label: 'Fluidez' },
  { value: 'voice', label: 'Voz' },
  { value: 'swallowing', label: 'Deglución' },
  { value: 'cognitive', label: 'Cognitivo' },
  { value: 'social', label: 'Social' },
  { value: 'reading', label: 'Lectura' },
  { value: 'writing', label: 'Escritura' }
];

// Componente principal
const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const { apiRequest } = useAuthStore();
  
  // Estado del formulario
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentEmail: '',
    skillLevel: 'beginner',
    primaryGoals: [],
    notes: ''
  });

  // Estado de la UI
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar campos requeridos
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = 'El email del padre/madre es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'El email del padre/madre no es válido';
    }

    if (formData.primaryGoals.length === 0) {
      newErrors.primaryGoals = 'Selecciona al menos un objetivo primario';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar cambios en checkboxes (objetivos primarios)
  const handleGoalChange = (goalValue: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goalValue)
        ? prev.primaryGoals.filter(goal => goal !== goalValue)
        : [...prev.primaryGoals, goalValue]
    }));
    
    // Limpiar error de objetivos primarios
    if (errors.primaryGoals) {
      setErrors(prev => ({
        ...prev,
        primaryGoals: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar (sin confirmPassword)
      const { confirmPassword, ...studentData } = formData;
      
      const response = await apiRequest('/students', 'POST', studentData);

      if (response.success) {
        toast.success('Estudiante creado exitosamente');
        navigate('/students');
      } else {
        toast.error(response.error?.message || 'Error al crear el estudiante');
      }
    } catch (error: any) {
      console.error('Error creando estudiante:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelar
  const handleCancel = () => {
    navigate('/students');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agregar Estudiante</h1>
                <p className="text-gray-600">Registra un nuevo estudiante en tu caseload</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información Personal */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa el nombre del estudiante"
                  />
                  {errors.firstName && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName}
                    </div>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ingresa el apellido del estudiante"
                  />
                  {errors.lastName && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Estudiante *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="estudiante@ejemplo.com"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Email del Padre/Madre */}
              <div>
                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Padre/Madre *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="parentEmail"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.parentEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="padre@ejemplo.com"
                  />
                </div>
                {errors.parentEmail && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.parentEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Información de Acceso */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <Lock className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Información de Acceso</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Repite la contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Información Académica</h2>
              </div>

              {/* Nivel de Habilidad */}
              <div>
                <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Habilidad *
                </label>
                <select
                  id="skillLevel"
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              {/* Objetivos Primarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Objetivos Primarios *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRIMARY_GOALS_OPTIONS.map((goal) => (
                    <label
                      key={goal.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.primaryGoals.includes(goal.value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.primaryGoals.includes(goal.value)}
                        onChange={() => handleGoalChange(goal.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{goal.label}</span>
                    </label>
                  ))}
                </div>
                {errors.primaryGoals && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.primaryGoals}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Información adicional sobre el estudiante..."
                  />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Crear Estudiante
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AddStudent;
