import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Props del componente PageLoader
interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

// Componente principal de PageLoader
const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Cargando...', 
  size = 'md',
  fullScreen = false 
}) => {
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      container: 'w-16 h-16',
      spinner: 'w-8 h-8',
      text: 'text-sm',
    },
    md: {
      container: 'w-24 h-24',
      spinner: 'w-12 h-12',
      text: 'text-base',
    },
    lg: {
      container: 'w-32 h-32',
      spinner: 'w-16 h-16',
      text: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  // Contenido del loader
  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner animado */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className={`${config.container} flex items-center justify-center`}
      >
        <Loader2 
          className={`${config.spinner} text-primary-600`} 
        />
      </motion.div>

      {/* Mensaje de carga */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={`${config.text} text-gray-600 font-medium text-center`}
        >
          {message}
        </motion.p>
      )}

      {/* Indicador de progreso animado */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className="w-2 h-2 bg-primary-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );

  // Renderizar como pantalla completa o inline
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        {loaderContent}
      </motion.div>
    );
  }

  // Renderizar inline
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center py-12"
    >
      {loaderContent}
    </motion.div>
  );
};

export default PageLoader;


