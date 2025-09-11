import React from 'react';

// Importar componentes
import AppRoutes from './components/AppRoutes';

// Importar hooks de autenticación
import { useIsInitialized } from './store/authStore';

// Componente de carga
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Componente principal de la aplicación
const App: React.FC = () => {
  const isInitialized = useIsInitialized();

  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppRoutes />
    </div>
  );
};

export default App;