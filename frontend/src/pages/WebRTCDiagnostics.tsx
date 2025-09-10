import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WebRTCCheck {
  name: string;
  supported: boolean;
  description: string;
  critical: boolean;
}

const WebRTCDiagnostics: React.FC = () => {
  const [checks, setChecks] = useState<WebRTCCheck[]>([]);
  const [userAgent, setUserAgent] = useState('');
  const [browserInfo, setBrowserInfo] = useState<any>({});

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = () => {
    const userAgentString = navigator.userAgent;
    setUserAgent(userAgentString);

    // Detectar navegador
    const browser = {
      isChrome: /Chrome/.test(userAgentString) && !/Edg/.test(userAgentString),
      isFirefox: /Firefox/.test(userAgentString),
      isSafari: /Safari/.test(userAgentString) && !/Chrome/.test(userAgentString),
      isEdge: /Edg/.test(userAgentString),
      isOpera: /Opera/.test(userAgentString),
      version: extractVersion(userAgentString)
    };
    setBrowserInfo(browser);

    // Realizar verificaciones
    const diagnostics: WebRTCCheck[] = [
      {
        name: 'HTTPS o Localhost',
        supported: location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1',
        description: 'WebRTC requiere conexión segura',
        critical: true
      },
      {
        name: 'RTCPeerConnection',
        supported: !!window.RTCPeerConnection,
        description: 'API principal de WebRTC',
        critical: true
      },
      {
        name: 'webkitRTCPeerConnection',
        supported: !!(window as any).webkitRTCPeerConnection,
        description: 'Prefijo WebKit para Chrome/Safari antiguos',
        critical: false
      },
      {
        name: 'mozRTCPeerConnection',
        supported: !!(window as any).mozRTCPeerConnection,
        description: 'Prefijo Mozilla para Firefox antiguos',
        critical: false
      },
      {
        name: 'RTCSessionDescription',
        supported: !!window.RTCSessionDescription,
        description: 'Para manejo de ofertas/respuestas',
        critical: true
      },
      {
        name: 'RTCIceCandidate',
        supported: !!window.RTCIceCandidate,
        description: 'Para candidatos ICE',
        critical: true
      },
      {
        name: 'navigator.mediaDevices',
        supported: !!navigator.mediaDevices,
        description: 'API moderna para acceso a dispositivos',
        critical: true
      },
      {
        name: 'getUserMedia (moderno)',
        supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        description: 'API moderna para cámara/micrófono',
        critical: true
      },
      {
        name: 'getUserMedia (legacy)',
        supported: !!(navigator.getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia),
        description: 'API legacy para navegadores antiguos',
        critical: false
      },
      {
        name: 'WebSocket',
        supported: !!window.WebSocket,
        description: 'Para señalización WebRTC',
        critical: true
      }
    ];

    setChecks(diagnostics);
  };

  const extractVersion = (ua: string): string => {
    const match = ua.match(/(Chrome|Firefox|Safari|Edg|Opera)\/(\d+\.\d+)/);
    return match ? `${match[1]} ${match[2]}` : 'Desconocido';
  };

  const getOverallStatus = () => {
    const criticalChecks = checks.filter(check => check.critical);
    const criticalSupported = criticalChecks.filter(check => check.supported);
    
    if (criticalSupported.length === criticalChecks.length) {
      return { status: 'success', message: 'WebRTC completamente soportado' };
    } else if (criticalSupported.length > 0) {
      return { status: 'warning', message: 'WebRTC parcialmente soportado' };
    } else {
      return { status: 'error', message: 'WebRTC no soportado' };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diagnóstico WebRTC
          </h1>
          <p className="text-gray-600">
            Verificación completa del soporte WebRTC en tu navegador
          </p>
        </motion.div>

        {/* Estado General */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className={`${
            overallStatus.status === 'success' ? 'border-green-200 bg-green-50' :
            overallStatus.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {overallStatus.status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                {overallStatus.status === 'warning' && <AlertCircle className="w-6 h-6 text-yellow-600" />}
                {overallStatus.status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
                <div>
                  <h3 className="font-semibold text-lg">
                    {overallStatus.message}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {overallStatus.status === 'success' && 'Tu navegador soporta todas las funcionalidades WebRTC necesarias.'}
                    {overallStatus.status === 'warning' && 'Tu navegador soporta WebRTC pero puede tener limitaciones.'}
                    {overallStatus.status === 'error' && 'Tu navegador no soporta WebRTC o necesita actualización.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Información del Navegador */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Información del Navegador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Navegador:</span>
                  <span className="ml-2">{browserInfo.version}</span>
                </div>
                <div>
                  <span className="font-medium">User Agent:</span>
                  <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                    {userAgent}
                  </code>
                </div>
                <div>
                  <span className="font-medium">URL Actual:</span>
                  <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                    {location.href}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verificaciones Detalladas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Verificaciones Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checks.map((check, index) => (
                  <motion.div
                    key={check.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {check.supported ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{check.name}</span>
                          {check.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Crítico
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{check.description}</p>
                      </div>
                    </div>
                    <Badge variant={check.supported ? "default" : "destructive"}>
                      {check.supported ? 'Soportado' : 'No soportado'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recomendaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overallStatus.status === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2">Acción Requerida:</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Actualiza tu navegador a la versión más reciente</li>
                      <li>• Usa Chrome, Firefox, Safari o Edge actualizados</li>
                      <li>• Asegúrate de estar en HTTPS o localhost</li>
                    </ul>
                  </div>
                )}
                
                {overallStatus.status === 'warning' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Mejoras Sugeridas:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Actualiza tu navegador para mejor compatibilidad</li>
                      <li>• Algunas funcionalidades pueden estar limitadas</li>
                    </ul>
                  </div>
                )}

                {overallStatus.status === 'success' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">¡Excelente!</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Tu navegador soporta WebRTC completamente</li>
                      <li>• Puedes usar todas las funcionalidades de video</li>
                      <li>• No se requieren acciones adicionales</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WebRTCDiagnostics;
