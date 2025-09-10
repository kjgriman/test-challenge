import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HTTPSDiagnostics: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  }, []);

  const diagnoseHTTPS = useCallback(() => {
    addLog('🔍 === DIAGNÓSTICO HTTPS ===');
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    addLog(`🌐 Protocolo: ${protocol}`);
    addLog(`🏠 Hostname: ${hostname}`);
    addLog(`🔌 Puerto: ${port}`);
    addLog(`🏠 Es localhost: ${isLocalhost ? '✅' : '❌'}`);
    
    // Verificar si es HTTPS
    const isHTTPS = protocol === 'https:';
    addLog(`🔒 Es HTTPS: ${isHTTPS ? '✅' : '❌'}`);
    
    // Verificar si es HTTP en localhost (permitido para WebRTC)
    const isHTTPLocalhost = protocol === 'http:' && isLocalhost;
    addLog(`🌐 HTTP en localhost: ${isHTTPLocalhost ? '✅' : '❌'}`);
    
    // Determinar si WebRTC debería funcionar
    const shouldWebRTCWork = isHTTPS || isHTTPLocalhost;
    addLog(`🎯 WebRTC debería funcionar: ${shouldWebRTCWork ? '✅' : '❌'}`);
    
    if (!shouldWebRTCWork) {
      addLog('⚠️ PROBLEMA DETECTADO: WebRTC requiere HTTPS o localhost');
      addLog('💡 Solución: Usar HTTPS o cambiar a localhost');
    }
    
    return shouldWebRTCWork;
  }, [addLog]);

  const testGetUserMedia = useCallback(async () => {
    try {
      addLog('🎥 === PROBANDO getUserMedia ===');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no está disponible');
      }
      
      addLog('✅ navigator.mediaDevices.getUserMedia disponible');
      
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false // Solo video para simplificar
      };
      
      addLog('🔍 Solicitando acceso a la cámara...');
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      addLog('✅ ¡Acceso a la cámara concedido!');
      
      // Mostrar video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        addLog('✅ Video mostrado correctamente');
      }
      
      // Información del stream
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        addLog(`📹 Track: ${track.label}`);
        addLog(`📹 Estado: ${track.readyState}`);
        addLog(`📹 Habilitado: ${track.enabled}`);
      }
      
      addLog('🎉 ¡getUserMedia funciona correctamente!');
      
    } catch (error) {
      const errorMessage = (error as Error).message;
      addLog(`❌ Error getUserMedia: ${errorMessage}`);
      
      // Analizar el tipo de error
      if (errorMessage.includes('NotAllowedError')) {
        addLog('🔒 Error: Permisos denegados');
        addLog('💡 Solución: Permitir acceso a la cámara en el navegador');
      } else if (errorMessage.includes('NotFoundError')) {
        addLog('📷 Error: No se encontró cámara');
        addLog('💡 Solución: Conectar una cámara');
      } else if (errorMessage.includes('NotSupportedError')) {
        addLog('🚫 Error: No soportado');
        addLog('💡 Solución: Verificar HTTPS o usar localhost');
      } else {
        addLog(`🔍 Error desconocido: ${errorMessage}`);
      }
      
      setError(errorMessage);
    }
  }, [addLog]);

  const testRTCPeerConnection = useCallback(() => {
    addLog('📡 === PROBANDO RTCPeerConnection ===');
    
    // Verificar disponibilidad
    const hasRTCPeerConnection = !!(
      window.RTCPeerConnection || 
      (window as any).webkitRTCPeerConnection || 
      (window as any).mozRTCPeerConnection
    );
    
    addLog(`📡 RTCPeerConnection disponible: ${hasRTCPeerConnection ? '✅' : '❌'}`);
    
    if (!hasRTCPeerConnection) {
      addLog('❌ RTCPeerConnection no está disponible');
      addLog('💡 Posibles causas:');
      addLog('   - Navegador no soporta WebRTC');
      addLog('   - WebRTC deshabilitado en flags');
      addLog('   - Políticas de empresa');
      addLog('   - Problema de HTTPS');
      return;
    }
    
    try {
      // Intentar crear conexión
      const config = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
      
      const pc = new window.RTCPeerConnection(config);
      addLog('✅ RTCPeerConnection creado exitosamente');
      
      // Cerrar conexión
      pc.close();
      addLog('✅ RTCPeerConnection cerrado correctamente');
      
    } catch (error) {
      addLog(`❌ Error creando RTCPeerConnection: ${(error as Error).message}`);
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Diagnóstico HTTPS y WebRTC</CardTitle>
            <p className="text-gray-600">
              Diagnóstico completo para identificar problemas de HTTPS y WebRTC.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={diagnoseHTTPS} variant="outline">
                🔍 Diagnóstico HTTPS
              </Button>
              <Button onClick={testGetUserMedia} variant="outline">
                🎥 Probar getUserMedia
              </Button>
              <Button onClick={testRTCPeerConnection} variant="outline">
                📡 Probar RTCPeerConnection
              </Button>
              <Button onClick={clearLogs} variant="outline">
                🗑️ Limpiar Logs
              </Button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <video 
              ref={localVideoRef}
              autoPlay 
              muted 
              className="w-full max-w-md rounded-md"
            />
            
            <div className="bg-gray-100 border rounded-md p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2">Logs:</h3>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HTTPSDiagnostics;
