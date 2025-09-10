import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Declarar PeerJS globalmente
declare global {
  interface Window {
    Peer: any;
  }
}

const PeerJSTest: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [peer, setPeer] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  }, []);

  const checkPeerJS = useCallback(() => {
    addLog('🔍 Verificando PeerJS...');
    
    if (typeof window.Peer !== 'undefined') {
      addLog('✅ PeerJS está disponible');
      addLog(`📦 Versión: ${window.Peer.VERSION || 'Desconocida'}`);
    } else {
      addLog('❌ PeerJS no está disponible');
      addLog('💡 Asegúrate de que el script de PeerJS esté cargado');
    }
    
    // Verificar getUserMedia
    const hasGetUserMedia = !!(
      navigator.mediaDevices?.getUserMedia ||
      navigator.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia
    );
    
    addLog(`📹 getUserMedia: ${hasGetUserMedia ? '✅' : '❌'}`);
    addLog(`🌐 Protocolo: ${window.location.protocol}`);
    addLog(`🏠 Hostname: ${window.location.hostname}`);
  }, [addLog]);

  const testPeerJS = useCallback(() => {
    addLog('🧪 Probando PeerJS...');
    
    if (typeof window.Peer === 'undefined') {
      addLog('❌ PeerJS no está disponible');
      return;
    }
    
    try {
      // Crear peer con servidor público
      const testPeer = new window.Peer();
      
      testPeer.on('open', (id: string) => {
        addLog(`✅ PeerJS funcionando - ID: ${id}`);
        testPeer.destroy();
      });
      
      testPeer.on('error', (error: any) => {
        addLog(`❌ Error PeerJS: ${error.message}`);
      });
      
      // Timeout para cerrar la conexión
      setTimeout(() => {
        if (testPeer && !testPeer.destroyed) {
          testPeer.destroy();
          addLog('⏰ Conexión de prueba cerrada');
        }
      }, 5000);
      
    } catch (error) {
      addLog(`❌ Error probando PeerJS: ${(error as Error).message}`);
    }
  }, [addLog]);

  const startVideoPeerJS = useCallback(async () => {
    try {
      setError(null);
      addLog('🎥 Iniciando video con PeerJS...');
      
      if (typeof window.Peer === 'undefined') {
        throw new Error('PeerJS no está disponible');
      }
      
      // Crear peer
      const newPeer = new window.Peer();
      
      newPeer.on('open', async (id: string) => {
        addLog(`✅ Conectado a PeerJS con ID: ${id}`);
        setIsConnected(true);
        
        try {
          // Obtener stream de video
          const constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: true
          };
          
          let stream;
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          } else if (navigator.getUserMedia) {
            stream = await new Promise((resolve, reject) => {
              navigator.getUserMedia(constraints, resolve, reject);
            });
          } else {
            throw new Error('getUserMedia no está disponible');
          }
          
          addLog('✅ Stream de video obtenido');
          
          // Mostrar video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            addLog('✅ Video local mostrado');
          }
          
          // Mostrar información del stream
          const videoTracks = stream.getVideoTracks();
          const audioTracks = stream.getAudioTracks();
          
          if (videoTracks.length > 0) {
            const videoTrack = videoTracks[0];
            addLog(`📹 Video: ${videoTrack.label}`);
            addLog(`📹 Video ${videoTrack.enabled ? 'activado' : 'desactivado'}`);
          }
          
          if (audioTracks.length > 0) {
            const audioTrack = audioTracks[0];
            addLog(`🎤 Audio: ${audioTrack.label}`);
            addLog(`🎤 Audio ${audioTrack.enabled ? 'activado' : 'desactivado'}`);
          }
          
          addLog('🎉 ¡Video funcionando con PeerJS!');
          
        } catch (error) {
          addLog(`❌ Error obteniendo stream: ${(error as Error).message}`);
          setError(`Error obteniendo stream: ${(error as Error).message}`);
        }
      });
      
      newPeer.on('error', (error: any) => {
        addLog(`❌ Error PeerJS: ${error.message}`);
        setError(`Error PeerJS: ${error.message}`);
      });
      
      setPeer(newPeer);
      
    } catch (error) {
      const errorMessage = `Error iniciando PeerJS: ${(error as Error).message}`;
      addLog(`❌ ${errorMessage}`);
      setError(errorMessage);
    }
  }, [addLog]);

  const startVideoSimulated = useCallback(async () => {
    try {
      setError(null);
      addLog('🎥 Iniciando video simulado (para desarrollo)...');
      
      // Crear un canvas con video simulado
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear contexto de canvas');
      }
      
      // Función para dibujar frame simulado
      const drawFrame = () => {
        // Fondo azul
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Círculo blanco (cara)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ojos
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 30, canvas.height / 2 - 20, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + 30, canvas.height / 2 - 20, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Boca
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 20, 0, Math.PI);
        ctx.stroke();
        
        // Texto
        ctx.fillStyle = '#000000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Video Simulado', canvas.width / 2, canvas.height - 50);
        ctx.fillText('Para Desarrollo', canvas.width / 2, canvas.height - 20);
      };
      
      // Dibujar frame inicial
      drawFrame();
      
      // Crear stream desde canvas
      const stream = canvas.captureStream(30); // 30 FPS
      
      addLog('✅ Stream de video simulado creado');
      
      // Mostrar video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        addLog('✅ Video simulado mostrado');
      }
      
      // Simular información del stream
      addLog('📹 Video: Simulado');
      addLog('📹 Video activado');
      addLog('🎤 Audio: Simulado');
      addLog('🎤 Audio activado');
      
      addLog('🎉 ¡Video simulado funcionando!');
      addLog('💡 Esto permite continuar el desarrollo sin WebRTC');
      
      setIsConnected(true);
      
    } catch (error) {
      const errorMessage = `Error iniciando video simulado: ${(error as Error).message}`;
      addLog(`❌ ${errorMessage}`);
      setError(errorMessage);
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
            <CardTitle>🔧 Prueba PeerJS (Alternativa a WebRTC)</CardTitle>
            <p className="text-gray-600">
              PeerJS es una librería que proporciona WebRTC de manera más compatible.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={checkPeerJS} variant="outline">
                🔍 Verificar PeerJS
              </Button>
              <Button onClick={testPeerJS} variant="outline">
                🧪 Probar PeerJS
              </Button>
              <Button onClick={startVideoPeerJS} variant="default">
                🎥 Iniciar Video con PeerJS
              </Button>
              <Button onClick={startVideoSimulated} variant="secondary">
                🎭 Video Simulado (Desarrollo)
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
              style={{ display: isConnected ? 'block' : 'none' }}
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

export default PeerJSTest;
