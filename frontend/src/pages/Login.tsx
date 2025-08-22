import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Heart } from 'lucide-react';

// Importar hooks y store
import { useAuthStore } from '../store/authStore';

// Componente principal de Login
const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'slp' as 'slp' | 'child',
    licenseNumber: '',
    specialization: [] as string[],
    yearsOfExperience: '',
    parentEmail: '',
    age: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, registerSLP, registerChild, error, isLoading } = useAuthStore();

  // Obtener la ruta de redirección desde el estado de ubicación
  const from = location.state?.from?.pathname || '/dashboard';

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para manejar especializaciones
  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialization: checked 
        ? [...prev.specialization, specialization]
        : prev.specialization.filter(s => s !== specialization)
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación para SLP
    if (!isLogin && formData.role === 'slp') {
      if (formData.specialization.length === 0) {
        alert('Debe seleccionar al menos una especialización');
        return;
      }
      if (!formData.yearsOfExperience || parseInt(formData.yearsOfExperience) < 0) {
        alert('Debe ingresar un número válido de años de experiencia');
        return;
      }
    }
    
    try {
      if (isLogin) {
        // Login
        await login(formData.email, formData.password);
        navigate(from, { replace: true });
      } else {
        // Registro
        if (formData.role === 'slp') {
          await registerSLP({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            licenseNumber: formData.licenseNumber,
            specialization: formData.specialization,
            yearsOfExperience: parseInt(formData.yearsOfExperience),
          });
        } else {
          await registerChild({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            parentEmail: formData.parentEmail,
            age: parseInt(formData.age),
          });
        }
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
    }
  };

  // Función para alternar entre login y registro
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'slp',
      licenseNumber: '',
      specialization: [],
      yearsOfExperience: '',
      parentEmail: '',
      age: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-therapy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Inicia sesión en tu cuenta de terapia' 
              : 'Únete a nuestra plataforma de terapia virtual'
            }
          </p>
        </motion.div>

        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos de registro (solo si no es login) */}
            {!isLogin && (
              <>
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                {/* Rol */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuario
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  >
                    <option value="slp">Terapeuta del Habla (SLP)</option>
                    <option value="child">Estudiante/Niño</option>
                  </select>
                </div>

                {/* Campos específicos por rol */}
                {formData.role === 'slp' && (
                  <>
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Licencia
                      </label>
                      <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Número de licencia profesional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Especializaciones
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'articulation', label: 'Articulación' },
                          { value: 'language', label: 'Lenguaje' },
                          { value: 'fluency', label: 'Fluidez' },
                          { value: 'voice', label: 'Voz' },
                          { value: 'swallowing', label: 'Deglución' },
                          { value: 'cognitive', label: 'Cognitivo' }
                        ].map((spec) => (
                                                      <label key={spec.value} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.specialization.includes(spec.value)}
                                onChange={(e) => handleSpecializationChange(spec.value, e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">{spec.label}</span>
                            </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                        Años de Experiencia
                      </label>
                      <input
                        type="number"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="50"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Años de experiencia profesional"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'child' && (
                  <>
                    <div>
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                        Edad
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="3"
                        max="18"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Edad del estudiante"
                      />
                    </div>
                    <div>
                      <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email del Padre/Tutor
                      </label>
                      <input
                        type="email"
                        id="parentEmail"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                        placeholder="Email del padre o tutor"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-error-50 border border-error-200 rounded-lg p-4"
              >
                <p className="text-sm text-error-800">{error}</p>
              </motion.div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-therapy text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </div>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
            >
              {isLogin 
                ? '¿No tienes cuenta? Crear una' 
                : '¿Ya tienes cuenta? Iniciar sesión'
              }
            </button>
          </div>

          {/* Separador */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>
          </div>

          {/* Botones sociales (placeholder para futuro) */}
          <div className="mt-6 space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700 underline">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 underline">
              Política de Privacidad
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;


