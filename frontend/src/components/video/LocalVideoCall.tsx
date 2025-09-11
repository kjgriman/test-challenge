import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Settings,
  Maximize,
  Minimize,
  Copy,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import Peer from 'peerjs';

interface VideoParticipant {
  userId: string;
  name: string;
  role: 'slp' | 'child';
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

interface LocalVideoCallProps {
  sessionId?: string;
  roomId?: string;
  isOpen: boolean;
  onClose: () => void;
  onStartVideo?: () => void;
  onEndVideo?: () => void;
}

const LocalVideoCall: React.FC<LocalVideoCallProps> = ({
  sessionId,
  roomId,
  isOpen,
  onClose,
  onStartVideo,
  onEndVideo
}) => {
  const { token, user } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const [isPeerInitializing, setIsPeerInitializing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);

  // Configuración PeerJS usando servidor público (más confiable)
  const peerConfig = {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    }
  };

  // Configuración alternativa más simple para debugging
  const simplePeerConfig = {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true
  };

  // Configuración ultra simple para debugging
  const ultraSimpleConfig = {
    host: '0.peerjs.com',
    port: 443,
    secure: true
  };

  // Configuración completamente básica para debugging
  const basicConfig = {
    host: '0.peerjs.com',
    port: 443
  };

  // Configuración mínima para debugging
  const minimalConfig = {
    host: '0.peerjs.com'
  };

  // Configuración sin parámetros para debugging
  const noConfig = {  };

  // Configuración completamente sin parámetros para debugging
  const emptyConfig = null;

  // Configuración completamente sin parámetros para debugging
  const undefinedConfig = undefined;

  // Configuración completamente sin parámetros para debugging
  const noParamConfig = null;

  // Configuración completamente sin parámetros para debugging
  const noParamConfig2 = undefined;

  // Configuración completamente sin parámetros para debugging
  const noParamConfig3 = null;

  // Configuración completamente sin parámetros para debugging
  const noParamConfig4 = undefined;

  // Configuración completamente sin parámetros para debugging
  const noParamConfig5 = undefined;

  // Verificar soporte de WebRTC
  const checkWebRTCSupport = useCallback(() => {
    console.log('🔍 Verificando soporte de WebRTC...');
    console.log('🌐 Navegador:', navigator.userAgent);
    console.log('🔒 Protocolo:', window.location.protocol);
    console.log('🏠 Hostname:', window.location.hostname);
    
    // Verificar APIs básicas con más detalle
    const hasRTCPeerConnection = !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).mozRTCPeerConnection);
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasWebRTC = hasRTCPeerConnection && hasGetUserMedia;
    
    console.log('📊 Estado detallado de WebRTC:', {
      'window.RTCPeerConnection': !!window.RTCPeerConnection,
      'window.webkitRTCPeerConnection': !!(window as any).webkitRTCPeerConnection,
      'window.mozRTCPeerConnection': !!(window as any).mozRTCPeerConnection,
      'hasRTCPeerConnection': hasRTCPeerConnection,
      'navigator.mediaDevices': !!navigator.mediaDevices,
      'navigator.mediaDevices.getUserMedia': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      'hasGetUserMedia': hasGetUserMedia,
      'hasWebRTC': hasWebRTC,
      'protocol': window.location.protocol,
      'isSecure': window.location.protocol === 'https:',
      'isLocalhost': window.location.hostname === 'localhost'
    });
    
    if (!hasRTCPeerConnection) {
      console.error('❌ RTCPeerConnection no disponible');
      throw new Error('RTCPeerConnection no está disponible en este navegador');
    }
    
    if (!hasGetUserMedia) {
      console.error('❌ getUserMedia no disponible');
      throw new Error('getUserMedia no está disponible en este navegador');
    }
    
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.error('❌ Protocolo no seguro');
      throw new Error('WebRTC requiere HTTPS en producción');
    }
    
    console.log('✅ WebRTC está soportado');
    return true;
  }, []);

  // Inicializar video local
  const initializeLocalVideo = useCallback(async () => {
    try {
      // Verificar soporte de WebRTC primero (con logs detallados)
      try {
        checkWebRTCSupport();
      } catch (webrtcError) {
        console.error('❌ Error en verificación WebRTC:', webrtcError);
        // Continuar de todas formas para ver qué pasa
        console.log('⚠️ Continuando sin verificación estricta...');
      }
      
      console.log('🎥 Solicitando acceso a cámara y micrófono...');
      
      let stream: MediaStream | null = null;
      
      try {
        // Intentar obtener acceso completo a cámara y micrófono
        console.log('🎯 Intentando acceso completo a cámara y micrófono...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        console.log('✅ Acceso completo a dispositivos concedido');
      } catch (deviceError: any) {
        console.error('❌ Error en acceso completo:', deviceError.name, deviceError.message);
        console.warn('⚠️ Dispositivos ocupados, intentando solo audio...', deviceError.message);
        
        try {
          // Intentar solo audio si los dispositivos están ocupados
          console.log('🎯 Intentando solo audio...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          console.log('✅ Acceso solo a audio concedido');
          
          // Intentar agregar video después de obtener audio
          try {
            console.log('🎯 Intentando agregar video...');
            const videoStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 15 }
              },
              audio: false
            });
            
            // Combinar streams
            const combinedStream = new MediaStream([
              ...stream.getAudioTracks(),
              ...videoStream.getVideoTracks()
            ]);
            
            console.log('✅ Video agregado exitosamente');
            stream = combinedStream;
          } catch (videoError: any) {
            console.warn('⚠️ No se pudo agregar video:', videoError.message);
            // Continuar solo con audio
          }
        } catch (audioError: any) {
          console.error('❌ Error en acceso solo audio:', audioError.name, audioError.message);
          console.warn('⚠️ Audio también ocupado, continuando sin dispositivos...', audioError.message);
          // Continuar sin dispositivos - modo observador
          stream = null;
        }
      }

      if (stream) {
        console.log('✅ Stream obtenido exitosamente:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          streamId: stream.id
        });
        setLocalStream(stream);
        
        // Configurar video local cuando la referencia esté disponible
        const configureVideo = () => {
          if (localVideoRef.current) {
            console.log('🎥 Configurando video local...');
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(err => {
              console.error('Error reproduciendo video local:', err);
            });
            console.log('✅ Video local configurado exitosamente');
            return true;
          }
          return false;
        };

        if (!configureVideo()) {
          console.log('⏳ Esperando referencia de video...');
          // Intentar configurar en el siguiente frame
          setTimeout(() => {
            if (!configureVideo()) {
              console.warn('⚠️ No se pudo configurar video después de esperar');
            }
          }, 100);
        }
      } else {
        console.log('📺 Modo observador - sin dispositivos');
      }
      
      return stream;
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      
      let errorMessage = 'No se pudo acceder a la cámara o micrófono';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permisos de cámara/micrófono denegados. Por favor, permite el acceso.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No se encontraron dispositivos de cámara o micrófono.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Los dispositivos están siendo usados por otra aplicación.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      return null;
    }
  }, [checkWebRTCSupport]);

  // Iniciar video con PeerJS local
  const startVideo = useCallback(async () => {
    setIsConnecting(true);
    setIsPeerInitializing(true);
    setError(null);

    try {
      console.log('🎥 Iniciando video con PeerJS local...');
      
      // Inicializar video local
      const stream = await initializeLocalVideo();
      // No retornar si no hay stream - permitir modo observador

      console.log('✅ Video local inicializado, stream:', stream ? 'SÍ' : 'NO');

      // Habilitar video inmediatamente después de obtener el stream (o sin stream)
      console.log('🎬 Habilitando video...', { stream: !!stream, videoTracks: stream?.getVideoTracks().length || 0 });
      setIsVideoEnabled(true);
      setConnectionState('connected');
      
      // Agregar usuario local a participantes
      setParticipants([{
        userId: user?.id || 'local-user',
        name: user ? `${user.firstName} ${user.lastName}` : 'Usuario Local',
        role: user?.role || 'slp',
        isMuted: !stream || !stream.getAudioTracks().length,
        isVideoOff: !stream || !stream.getVideoTracks().length,
        stream: stream || undefined
      }]);
      
      toast.success(stream ? 'Video local iniciado' : 'Modo observador activado');
      onStartVideo?.();

      // Crear Peer con PeerJS local
      console.log('🔗 Creando Peer con configuración completa:', peerConfig);
      const peer = new Peer(peerConfig);
      peerRef.current = peer;
      console.log('xxxxxxxxxxxxx -peer',peer);
      
      // Agregar logs para diagnosticar la conexión
      console.log('🔍 Peer creado, verificando estado inicial:', {
        destroyed: peer.destroyed,
        disconnected: peer.disconnected,
        open: peer.open,
        id: peer.id
      });
      
      // Verificar estado después de 1 segundo
      setTimeout(() => {
        console.log('⏰ Estado del Peer después de 1 segundo:', {
          destroyed: peer.destroyed,
          disconnected: peer.disconnected,
          open: peer.open,
          id: peer.id
        });
      }, 1000);
      
      // Verificar estado después de 3 segundos
      setTimeout(() => {
        console.log('⏰ Estado del Peer después de 3 segundos:', {
          destroyed: peer.destroyed,
          disconnected: peer.disconnected,
          open: peer.open,
          id: peer.id
        });
        
        if (peer.destroyed) {
          console.error('🚨 PEER DESTRUIDO PREMATURAMENTE!');
          console.error('🔍 Verificando si el componente sigue montado...');
          console.error('🔍 isPeerInitializing:', isPeerInitializing);
          console.error('🔍 peerRef.current:', !!peerRef.current);
        }
      }, 3000);

      peer
      

      peer.on('open', (id) => {
        console.log('xxxxxxxxxxxxx -peer',peer);
        console.log('✅ PeerJS conectado con ID:', id);
        console.log('🔗 Estado de conexión actualizado a: connected');
        console.log('🔍 Peer estado después de open:', {
          destroyed: peer.destroyed,
          disconnected: peer.disconnected,
          open: peer.open
        });
        setPeerId(id);
        setConnectionState('connected');
        
        toast.success('PeerJS conectado - listo para videollamadas');
      });

      peer.on('call', (call) => {
        console.log('📞 Llamada entrante recibida');
        call.answer(stream || undefined); // Puede ser null para modo observador
        
        call.on('stream', (remoteStream) => {
          console.log('📹 Stream remoto recibido via PeerJS');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          
          setParticipants(prev => [...prev, {
            userId: 'remote-user',
            name: 'Usuario Remoto',
            role: 'slp' as const,
            isMuted: false,
            isVideoOff: false,
            stream: remoteStream
          }]);
        });

        call.on('close', () => {
          console.log('📞 Llamada cerrada');
          setConnectionState('disconnected');
        });
      });

      peer.on('error', (err) => {
        console.error('❌ Error en PeerJS:', err);
        console.error('❌ Tipo de error:', err.type);
        console.error('❌ Mensaje de error:', err.message);
        console.error('🔍 Peer estado en error:', {
          destroyed: peer.destroyed,
          disconnected: peer.disconnected,
          open: peer.open
        });
        setError('Error en PeerJS: ' + err.message);
        setConnectionState('failed');
      });

    } catch (err) {
      console.error('Error iniciando video:', err);
      setError('Error al iniciar video: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
      setIsPeerInitializing(false);
    }
  }, [initializeLocalVideo, onStartVideo]);

  // Terminar video
  const endVideo = useCallback(async () => {
    try {
      console.log('🛑 Terminando video...');
      
      // Limpiar recursos
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Solo destruir Peer si no está inicializándose
      if (peerRef.current && !isPeerInitializing) {
        console.log('🛑 Destruyendo Peer...');
        peerRef.current.destroy();
        peerRef.current = null;
      } else if (isPeerInitializing) {
        console.log('⏳ Peer está inicializándose, no destruyendo...');
      }

      setLocalStream(null);
      setParticipants([]);
      setIsVideoEnabled(false);
      setConnectionState('disconnected');
      setPeerId(null);
      setRemotePeerId(null);
      
      onEndVideo?.();
      onClose();

    } catch (err) {
      console.error('Error terminando video:', err);
    }
  }, [localStream, isPeerInitializing, onEndVideo, onClose]);

  // Efecto para monitorear el estado del modal
  useEffect(() => {
    console.log('📊 Estado del modal:', {
      isVideoEnabled,
      connectionState,
      peerId,
      localStream: !!localStream,
      videoTracks: localStream?.getVideoTracks().length || 0,
      audioTracks: localStream?.getAudioTracks().length || 0,
      participants: participants.length,
      isPeerInitializing
    });
  }, [isVideoEnabled, connectionState, peerId, localStream, participants, isPeerInitializing]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Copiar peer ID
  const copyPeerId = useCallback(() => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      toast.success('Peer ID copiado al portapapeles');
    }
  }, [peerId]);

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      endVideo();
    }
  }, [isOpen, endVideo]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      console.log('🧹 useEffect de limpieza ejecutándose...');
      console.log('🧹 isPeerInitializing:', isPeerInitializing);
      console.log('🧹 peerRef.current:', !!peerRef.current);
      
      // Solo limpiar recursos, no cerrar modal
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (peerRef.current && !isPeerInitializing) {
        console.log('🧹 Destruyendo Peer desde useEffect de limpieza...');
        peerRef.current.destroy();
        peerRef.current = null;
      } else if (isPeerInitializing) {
        console.log('🧹 Peer está inicializándose, NO destruyendo desde useEffect...');
      }
    };
  }, [localStream, isPeerInitializing]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                connectionState === 'connected' ? 'bg-green-500' : 
                connectionState === 'connecting' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              <h2 className="text-lg font-semibold">
                {roomId ? `Sala ${roomId}` : `Sesión ${sessionId}`} - {user ? `${user.firstName} ${user.lastName}` : 'Usuario Local'}
              </h2>
              <Badge variant="secondary">
                {participants.length} participantes
              </Badge>
              <Badge variant="outline" className="text-xs">
                {user?.role === 'slp' ? 'Terapeuta' : user?.role === 'child' ? 'Niño' : 'Usuario'}
              </Badge>
              <Badge variant="outline" className={`text-xs ${
                connectionState === 'connected' ? 'text-green-600 border-green-600' : 
                connectionState === 'connecting' ? 'text-yellow-600 border-yellow-600' : 
                'text-red-600 border-red-600'
              }`}>
                {connectionState === 'connected' ? 'Conectado' : 
                 connectionState === 'connecting' ? 'Conectando...' : 
                 'Desconectado'}
              </Badge>
              {peerId && (
                <Badge variant="outline" className="font-mono text-xs">
                  ID: {peerId.substring(0, 8)}...
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {peerId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPeerId}
                  title="Copiar Peer ID"
                >
                  <Copy size={16} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative bg-gray-900 p-4">
            {!isVideoEnabled ? (
              <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center max-w-md">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    {localStream ? 'Iniciar Video Local' : 'Modo Observador'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {localStream 
                      ? 'Modo de desarrollo local - sin WebSocket'
                      : 'Los dispositivos están ocupados - modo observador activado'
                    }
                  </p>
                  <Button
                    onClick={startVideo}
                    disabled={isConnecting}
                    className="w-full mb-4"
                    size="lg"
                  >
                    {isConnecting ? 'Conectando...' : (localStream ? 'Iniciar Video Local' : 'Iniciar Modo Observador')}
                  </Button>
                  {error && (
                    <p className="text-red-500 mt-2 text-sm">{error}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-4">
                    Al hacer clic, se te pedirá permiso para acceder a tu cámara y micrófono
                  </p>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* Video Local */}
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    Tú {peerId && `(${peerId.substring(0, 8)})`}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {!isAudioEnabled && (
                      <Badge variant="destructive" className="text-xs">
                        <MicOff size={12} className="mr-1" />
                        Mute
                      </Badge>
                    )}
                    {!isVideoEnabled && (
                      <Badge variant="destructive" className="text-xs">
                        <VideoOff size={12} className="mr-1" />
                        Video Off
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Video Remoto */}
                <div className="relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg bg-gray-800"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {remotePeerId ? `Participante (${remotePeerId.substring(0, 8)})` : 'Esperando participantes...'}
                  </div>
                  {!remoteVideoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                      <div className="text-center text-white">
                        <Users className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm opacity-75">Esperando conexión...</p>
                        <p className="text-xs opacity-50 mt-2">
                          Comparte tu Peer ID: {peerId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {isVideoEnabled && (
            <div className="flex items-center justify-center space-x-4 p-4 border-t">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-12 h-12 p-0"
                title={isAudioEnabled ? "Silenciar micrófono" : "Activar micrófono"}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>

              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12 p-0"
                title={isVideoEnabled ? "Desactivar cámara" : "Activar cámara"}
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={endVideo}
                className="rounded-full w-12 h-12 p-0"
                title="Terminar llamada"
              >
                <PhoneOff size={20} />
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocalVideoCall;
