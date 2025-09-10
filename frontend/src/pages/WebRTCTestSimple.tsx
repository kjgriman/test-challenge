import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

const WebRTCTest: React.FC = () => {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  }, []);

  const checkWebRTCSupport = useCallback(() => {
    addLog('🔍 Verificando soporte WebRTC...');
    
    // Diagnóstico profundo de RTCPeerConnection
    addLog('📡 === DIAGNÓSTICO RTCPeerConnection ===');
    addLog(`   window.RTCPeerConnection: ${typeof window.RTCPeerConnection}`);
    addLog(`   window.webkitRTCPeerConnection: ${typeof (window as any).webkitRTCPeerConnection}`);
    addLog(`   window.mozRTCPeerConnection: ${typeof (window as any).mozRTCPeerConnection}`);
    addLog(`   globalThis.RTCPeerConnection: ${typeof (globalThis as any).RTCPeerConnection}`);
    addLog(`   self.RTCPeerConnection: ${typeof (self as any).RTCPeerConnection}`);
    
    // Verificar si está definido globalmente
    addLog(`   typeof RTCPeerConnection: ${typeof RTCPeerConnection}`);
    
    // Verificar en diferentes contextos
    try {
      addLog('🧪 Probando acceso directo...');
      const testPC = RTCPeerConnection;
      addLog(`   RTCPeerConnection directo: ${typeof testPC}`);
    } catch (e) {
      addLog(`   ❌ Error acceso directo: ${(e as Error).message}`);
    }
    
    try {
      addLog('🧪 Probando window.RTCPeerConnection...');
      const testPC = window.RTCPeerConnection;
      addLog(`   window.RTCPeerConnection: ${typeof testPC}`);
    } catch (e) {
      addLog(`   ❌ Error window.RTCPeerConnection: ${(e as Error).message}`);
    }
    
    // Verificar RTCPeerConnection
    const hasRTCPeerConnection = !!(
      window.RTCPeerConnection || 
      (window as any).webkitRTCPeerConnection || 
      (window as any).mozRTCPeerConnection ||
      (globalThis as any).RTCPeerConnection ||
      (self as any).RTCPeerConnection
    );
    
    // Verificar getUserMedia
    const hasGetUserMedia = !!(
      navigator.mediaDevices?.getUserMedia ||
      navigator.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia
    );
    
    addLog(`📡 RTCPeerConnection: ${hasRTCPeerConnection ? '✅' : '❌'}`);
    addLog(`📹 getUserMedia: ${hasGetUserMedia ? '✅' : '❌'}`);
    addLog(`🌐 Protocolo: ${window.location.protocol}`);
    addLog(`🏠 Hostname: ${window.location.hostname}`);
    
    // Información adicional del navegador
    addLog('🌐 === INFORMACIÓN DEL NAVEGADOR ===');
    addLog(`   User Agent: ${navigator.userAgent}`);
    addLog(`   Platform: ${navigator.platform}`);
    addLog(`   Language: ${navigator.language}`);
    addLog(`   Cookie Enabled: ${navigator.cookieEnabled}`);
    addLog(`   OnLine: ${navigator.onLine}`);
    
    return hasRTCPeerConnection && hasGetUserMedia;
  }, [addLog]);

  const startVideo = useCallback(async () => {
    try {
      setError(null);
      addLog('🎥 Iniciando video...');
      
      // Verificar soporte WebRTC
      if (!checkWebRTCSupport()) {
        throw new Error('WebRTC no está soportado en este navegador');
      }
      
      // Obtener stream de cámara
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      };
      
      addLog('📹 Solicitando acceso a cámara y micrófono...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      addLog('✅ Acceso a cámara y micrófono obtenido');
      
      // Mostrar stream local
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play();
      }
      
      localStreamRef.current = stream;
      setIsVideoOn(true);
      setIsAudioOn(true);
      
      addLog('🎬 Video iniciado correctamente');
      
    } catch (error) {
      const errorMessage = `Error iniciando video: ${(error as Error).message}`;
      addLog(`❌ ${errorMessage}`);
      setError(errorMessage);
    }
  }, [checkWebRTCSupport, addLog]);

  const stopVideo = useCallback(() => {
    addLog('🛑 Deteniendo video...');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        addLog(`🔇 Track ${track.kind} detenido`);
      });
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsVideoOn(false);
    setIsAudioOn(false);
    addLog('✅ Video detenido');
  }, [addLog]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        addLog(`📹 Video ${videoTrack.enabled ? 'activado' : 'desactivado'}`);
      }
    }
  }, [addLog]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        addLog(`🎤 Audio ${audioTrack.enabled ? 'activado' : 'desactivado'}`);
      }
    }
  }, [addLog]);

  const testRTCPeerConnection = useCallback(() => {
    try {
      addLog('🧪 Probando RTCPeerConnection...');
      
      // Método 1: Acceso directo
      try {
        addLog('🔍 Método 1: Acceso directo a RTCPeerConnection');
        const pc1 = new RTCPeerConnection();
        addLog('✅ RTCPeerConnection creado con acceso directo');
        pc1.close();
      } catch (e) {
        addLog(`❌ Método 1 falló: ${(e as Error).message}`);
      }
      
      // Método 2: window.RTCPeerConnection
      try {
        addLog('🔍 Método 2: window.RTCPeerConnection');
        const pc2 = new window.RTCPeerConnection();
        addLog('✅ RTCPeerConnection creado con window.RTCPeerConnection');
        pc2.close();
      } catch (e) {
        addLog(`❌ Método 2 falló: ${(e as Error).message}`);
      }
      
      // Método 3: webkitRTCPeerConnection
      try {
        addLog('🔍 Método 3: webkitRTCPeerConnection');
        const pc3 = new (window as any).webkitRTCPeerConnection();
        addLog('✅ RTCPeerConnection creado con webkitRTCPeerConnection');
        pc3.close();
      } catch (e) {
        addLog(`❌ Método 3 falló: ${(e as Error).message}`);
      }
      
      // Método 4: mozRTCPeerConnection
      try {
        addLog('🔍 Método 4: mozRTCPeerConnection');
        const pc4 = new (window as any).mozRTCPeerConnection();
        addLog('✅ RTCPeerConnection creado con mozRTCPeerConnection');
        pc4.close();
      } catch (e) {
        addLog(`❌ Método 4 falló: ${(e as Error).message}`);
      }
      
      // Método 5: globalThis
      try {
        addLog('🔍 Método 5: globalThis.RTCPeerConnection');
        const pc5 = new (globalThis as any).RTCPeerConnection();
        addLog('✅ RTCPeerConnection creado con globalThis.RTCPeerConnection');
        pc5.close();
      } catch (e) {
        addLog(`❌ Método 5 falló: ${(e as Error).message}`);
      }
      
      addLog('🏁 Pruebas de RTCPeerConnection completadas');
      
    } catch (error) {
      const errorMessage = `Error probando RTCPeerConnection: ${(error as Error).message}`;
      addLog(`❌ ${errorMessage}`);
      setError(errorMessage);
    }
  }, [addLog]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Prueba WebRTC Simplificada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Local */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Video Local</h3>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-48 object-cover"
                  />
                  {!isVideoOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      <CameraOff className="h-12 w-12" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Video Remoto */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Video Remoto</h3>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    <CameraOff className="h-12 w-12" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={checkWebRTCSupport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Verificar WebRTC
              </Button>
              
              <Button
                onClick={testRTCPeerConnection}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Probar RTCPeerConnection
              </Button>
              
              <Button
                onClick={isVideoOn ? stopVideo : startVideo}
                variant={isVideoOn ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isVideoOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                {isVideoOn ? 'Detener Video' : 'Iniciar Video'}
              </Button>
              
              {isVideoOn && (
                <>
                  <Button
                    onClick={toggleVideo}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isVideoOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                    {isVideoOn ? 'Desactivar Video' : 'Activar Video'}
                  </Button>
                  
                  <Button
                    onClick={toggleAudio}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isAudioOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isAudioOn ? 'Desactivar Audio' : 'Activar Audio'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de WebRTC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No hay logs aún...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
            <Button
              onClick={() => setLogs([])}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Limpiar Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebRTCTest;
