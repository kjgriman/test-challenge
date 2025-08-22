import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-900 mb-2">
              Error en Videollamada
            </h3>
            <p className="text-red-700 mb-6">
              Ocurrió un error al cargar la videollamada
            </p>
            <div className="bg-white rounded-lg p-4 mb-6 border border-red-200">
              <p className="text-sm text-red-600">
                <strong>Error:</strong> {this.state.error?.message || 'Error desconocido'}
              </p>
              <p className="text-sm text-red-600 mt-2">
                <strong>Solución:</strong> Recarga la página o verifica tu conexión
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-outline"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
