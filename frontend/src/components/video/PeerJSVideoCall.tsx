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

interface PeerJSVideoCallProps {
  sessionId?: string;
  roomId?: string;
  isOpen: boolean;
  onClose: () => void;
  onStartVideo?: () => void;
  onEndVideo?: () => void;
}

const PeerJSVideoCall: React.FC<PeerJSVideoCallProps> = ({
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
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const socketRef = useRef<any>(null);

  // Configuración PeerJS optimizada
  const peerConfig = {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    }
  };

  // Inicializar video local
  const initializeLocalVideo = useCallback(async () => {
    try {
      console.log('🎥 Solicitando acceso a cámara y micrófono...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('✅ Acceso a dispositivos concedido');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(err => {
          console.error('Error reproduciendo video local:', err);
        });
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
  }, []);

  // Conectar WebSocket para señalización
  const connectSocket = useCallback(() => {
    if (!token) {
      console.error('❌ No hay token disponible para WebSocket');
      return;
    }

    console.log('🔌 Conectando WebSocket para señalización...');

    import('socket.io-client').then(({ io }) => {
      // Configuración simplificada: Backend HTTPS siempre
      const getSocketUrl = () => {
        if (import.meta.env.VITE_SOCKET_URL) {
          return import.meta.env.VITE_SOCKET_URL;
        }
        if (import.meta.env.DEV) {
          return 'https://localhost:3001';
        }
        return 'http://localhost:3001';
      };
      
      const socket = io(
        getSocketUrl(),
        {
          auth: { token },
          transports: ["websocket", "polling"],
          timeout: 20000,
          forceNew: true,
          path: '/socket.io/'
        }
      );

      socket.on('connect', () => {
        console.log('✅ Conectado al servidor de señalización');
        const roomIdentifier = roomId || sessionId;
        if (roomIdentifier) {
          socket.emit('join-video-room', roomIdentifier);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error conectando WebSocket:', error);
        setError('Error conectando al servidor: ' + error.message);
      });

      socket.on('peer-id-shared', (data: { peerId: string, fromUserId: string }) => {
        console.log('📡 Peer ID recibido:', data.peerId);
        setRemotePeerId(data.peerId);
        
        // Iniciar llamada con el peer remoto
        if (peerRef.current && localStream) {
          const call = peerRef.current.call(data.peerId, localStream);
          
          call.on('stream', (remoteStream) => {
            console.log('📹 Stream remoto recibido');
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on('close', () => {
            console.log('📞 Llamada cerrada');
            setConnectionState('disconnected');
          });
        }
      });

      socket.on('participant-joined-room', (participant: VideoParticipant) => {
        setParticipants(prev => [...prev, participant]);
        toast.success(`${participant.name} se ha unido a la sala`);
      });

      socket.on('participant-left-room', (participant: VideoParticipant) => {
        setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
        toast(`${participant.name} ha salido de la sala`);
      });

      socketRef.current = socket;
    });
  }, [token, roomId, sessionId]);

  // Iniciar video con PeerJS
  const startVideo = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🎥 Iniciando video con PeerJS...');
      
      // Inicializar video local
      const stream = await initializeLocalVideo();
      if (!stream) return;

      console.log('✅ Video local inicializado');

      // Crear Peer con PeerJS
      const peer = new Peer(peerConfig);
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('✅ PeerJS conectado con ID:', id);
        setPeerId(id);
        setConnectionState('connected');
        setIsVideoEnabled(true);
        
        // Compartir nuestro peer ID con otros participantes
        if (socketRef.current) {
          const roomIdentifier = roomId || sessionId;
          if (roomIdentifier) {
            socketRef.current.emit('share-peer-id', {
              roomId: roomIdentifier,
              peerId: id,
              userId: (user as any)?._id || user?.id || 'unknown'
            });
          }
        }
        
        toast.success('Video conferencia iniciada');
        onStartVideo?.();
      });

      peer.on('call', (call) => {
        console.log('📞 Llamada entrante recibida');
        call.answer(stream);
        
        call.on('stream', (remoteStream) => {
          console.log('📹 Stream remoto recibido via PeerJS');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        call.on('close', () => {
          console.log('📞 Llamada cerrada');
          setConnectionState('disconnected');
        });
      });

      peer.on('error', (err) => {
        console.error('❌ Error en PeerJS:', err);
        setError('Error en PeerJS: ' + err.message);
        setConnectionState('failed');
      });

      // Conectar WebSocket para señalización
      connectSocket();

    } catch (err) {
      console.error('Error iniciando video:', err);
      setError('Error al iniciar video: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, [initializeLocalVideo, connectSocket, roomId, sessionId, user, onStartVideo]);

  // Terminar video
  const endVideo = useCallback(async () => {
    try {
      console.log('🛑 Terminando video...');
      
      // Limpiar recursos
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
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
  }, [localStream, onEndVideo, onClose]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Notificar al servidor
        if (socketRef.current) {
          const roomIdentifier = roomId || sessionId;
          if (roomIdentifier) {
            socketRef.current.emit('participant-update-room', {
              roomId: roomIdentifier,
              isMuted: !audioTrack.enabled
            });
          }
        }
      }
    }
  }, [localStream, roomId, sessionId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Notificar al servidor
        if (socketRef.current) {
          const roomIdentifier = roomId || sessionId;
          if (roomIdentifier) {
            socketRef.current.emit('participant-update-room', {
              roomId: roomIdentifier,
              isVideoOff: !videoTrack.enabled
            });
          }
        }
      }
    }
  }, [localStream, roomId, sessionId]);

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
      endVideo();
    };
  }, [endVideo]);

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
          className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col"
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
                {roomId ? `Sala ${roomId}` : `Sesión ${sessionId}`}
              </h2>
              <Badge variant="secondary">
                {participants.length} participantes
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
                  <h3 className="text-xl font-semibold mb-4">Iniciar Video Conferencia</h3>
                  <p className="text-gray-600 mb-6">
                    Conecta con otros participantes usando PeerJS para una conexión P2P directa
                  </p>
                  <Button
                    onClick={startVideo}
                    disabled={isConnecting}
                    className="w-full mb-4"
                    size="lg"
                  >
                    {isConnecting ? 'Conectando...' : 'Iniciar Video Conferencia'}
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

export default PeerJSVideoCall;
