import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WebRTCTest: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>({});
  const videoRef = useRef<HTMLVideoElement>(null);

  // Función de prueba WebRTC simple
  const testWebRTC = async () => {
    const results: any = {};
    
    try {
      // Test 1: Verificar APIs básicas
      results.rtcPeerConnection = !!window.RTCPeerConnection;
      results.webkitRTCPeerConnection = !!(window as any).webkitRTCPeerConnection;
      results.mozRTCPeerConnection = !!(window as any).mozRTCPeerConnection;
      results.mediaDevices = !!navigator.mediaDevices;
      results.getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      // Test 2: Intentar crear RTCPeerConnection
      try {
        if (window.RTCPeerConnection) {
          const pc = new window.RTCPeerConnection({});
          results.rtcPeerConnectionWorks = true;
          pc.close();
        } else if ((window as any).webkitRTCPeerConnection) {
          const pc = new (window as any).webkitRTCPeerConnection({});
          results.webkitRTCPeerConnectionWorks = true;
          pc.close();
        }
      } catch (e) {
        results.rtcPeerConnectionError = e.message;
      }

      // Test 3: Intentar getUserMedia
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        results.getUserMediaWorks = true;
        testStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        results.getUserMediaError = e.message;
      }

      setTestResults(results);
      console.log('🧪 Resultados de prueba WebRTC:', results);
      
    } catch (error) {
      console.error('Error en prueba WebRTC:', error);
      setError('Error en la prueba: ' + (error as Error).message);
    }
  };

  // Iniciar cámara
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      console.log('✅ Cámara iniciada correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error accediendo a la cámara: ' + errorMessage);
      console.error('Error:', err);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Ejecutar pruebas al cargar
  useEffect(() => {
    testWebRTC();
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba WebRTC Simple
          </h1>
          <p className="text-gray-600">
            Prueba básica para verificar que WebRTC funciona en tu navegador
          </p>
        </motion.div>

        {/* Resultados de Prueba */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Prueba WebRTC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {testResults.rtcPeerConnection ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">RTCPeerConnection</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.webkitRTCPeerConnection ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">webkitRTCPeerConnection</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.mediaDevices ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">mediaDevices</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.getUserMedia ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">getUserMedia</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.rtcPeerConnectionWorks ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">RTCPeerConnection Works</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.getUserMediaWorks ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">getUserMedia Works</span>
                </div>
              </div>
              
              {testResults.rtcPeerConnectionError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Error RTCPeerConnection:</strong> {testResults.rtcPeerConnectionError}
                  </p>
                </div>
              )}
              
              {testResults.getUserMediaError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Error getUserMedia:</strong> {testResults.getUserMediaError}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Prueba de Cámara */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Prueba de Cámara</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video */}
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-w-md mx-auto rounded-lg bg-black"
                    style={{ display: stream ? 'block' : 'none' }}
                  />
                  {!stream && (
                    <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Presiona "Iniciar Cámara" para ver el video</p>
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={stream ? stopCamera : startCamera}
                    variant={stream ? "destructive" : "default"}
                  >
                    {stream ? 'Detener Cámara' : 'Iniciar Cámara'}
                  </Button>
                  
                  {stream && (
                    <>
                      <Button
                        onClick={toggleVideo}
                        variant={isVideoEnabled ? "default" : "outline"}
                      >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        onClick={toggleAudio}
                        variant={isAudioEnabled ? "default" : "outline"}
                      >
                        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                    </>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Información del Navegador */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Información del Navegador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>User Agent:</strong> {navigator.userAgent}
                </div>
                <div>
                  <strong>URL:</strong> {location.href}
                </div>
                <div>
                  <strong>Protocolo:</strong> {location.protocol}
                </div>
                <div>
                  <strong>Hostname:</strong> {location.hostname}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default WebRTCTest;
