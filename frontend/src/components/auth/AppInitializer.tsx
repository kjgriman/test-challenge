import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart } from 'lucide-react';

// Importar store
import { useAuthStore } from '../../store/authStore';

// Componente principal de AppInitializer
const AppInitializer: React.FC = () => {
  const { isInitialized } = useAuthStore();

  // La inicialización se maneja automáticamente en el store

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo animado */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 bg-gradient-therapy rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Heart className="w-12 h-12 text-white" />
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Terapia del Habla
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-gray-600 mb-8"
          >
            Plataforma Virtual de Terapia
          </motion.p>

          {/* Spinner de carga */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center space-x-2"
          >
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            <span className="text-primary-600 font-medium">
              Inicializando aplicación...
            </span>
          </motion.div>

          {/* Indicador de progreso */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto"
          >
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            />
          </motion.div>

          {/* Mensaje de estado */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-4 text-sm text-gray-500"
          >
            Preparando tu experiencia de terapia...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // La aplicación está inicializada, no renderizar nada
  return null;
};

export default AppInitializer;


