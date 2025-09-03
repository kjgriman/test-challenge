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
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

interface VideoParticipant {
  userId: string;
  name: string;
  role: 'slp' | 'child';
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

interface VideoCallProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onStartVideo?: () => void;
  onEndVideo?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  sessionId,
  isOpen,
  onClose,
  onStartVideo,
  onEndVideo
}) => {
  const { token } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Configuración WebRTC
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Inicializar video local
  const initializeLocalVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setError('No se pudo acceder a la cámara o micrófono');
      return null;
    }
  }, []);

  // Conectar WebSocket
  const connectSocket = useCallback(() => {
    if (!token) return;

    // Importar Socket.IO dinámicamente
    import('socket.io-client').then(({ io }) => {
      const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        auth: { token }
      });

      socket.on('connect', () => {
        console.log('🔌 Conectado al servidor de video');
        socket.emit('join-video-session', sessionId);
      });

      socket.on('video-participants', (participantsList: VideoParticipant[]) => {
        setParticipants(participantsList);
      });

      socket.on('participant-joined', (participant: VideoParticipant) => {
        setParticipants(prev => [...prev, participant]);
      });

      socket.on('participant-left', (participant: VideoParticipant) => {
        setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
      });

      socket.on('video-signal', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
          } catch (err) {
            console.error('Error procesando señal remota:', err);
          }
        }
      });

      socket.on('error', (errorMessage: string) => {
        setError(errorMessage);
      });

      socketRef.current = socket;
    });
  }, [token, sessionId]);

  // Iniciar video
  const startVideo = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Iniciar video en el backend
              const response = await fetch(`${import.meta.env.VITE_API_URL}/video/sessions/${sessionId}/start-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al iniciar video');
      }

      // Inicializar video local
      const stream = await initializeLocalVideo();
      if (!stream) return;

      // Conectar WebSocket
      connectSocket();

      // Crear conexión WebRTC
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;

      // Agregar stream local
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Manejar candidatos ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('video-signal', {
            sessionId,
            signal: event.candidate,
            targetUserId: 'all'
          });
        }
      };

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setIsVideoEnabled(true);
      onStartVideo?.();

    } catch (err) {
      console.error('Error iniciando video:', err);
      setError('Error al iniciar video');
    } finally {
      setIsConnecting(false);
    }
  }, [sessionId, token, initializeLocalVideo, connectSocket, onStartVideo]);

  // Terminar video
  const endVideo = useCallback(async () => {
    try {
      // Terminar video en el backend
      await fetch(`${import.meta.env.VITE_API_URL}/video/sessions/${sessionId}/end-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Limpiar recursos
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      setLocalStream(null);
      setParticipants([]);
      setIsVideoEnabled(false);
      onEndVideo?.();

    } catch (err) {
      console.error('Error terminando video:', err);
    }
  }, [sessionId, token, localStream, onEndVideo]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Notificar al servidor
        if (socketRef.current) {
          socketRef.current.emit('participant-update', {
            sessionId,
            isMuted: !audioTrack.enabled
          });
        }
      }
    }
  }, [localStream, sessionId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Notificar al servidor
        if (socketRef.current) {
          socketRef.current.emit('participant-update', {
            sessionId,
            isVideoOff: !videoTrack.enabled
          });
        }
      }
    }
  }, [localStream, sessionId]);

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
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h2 className="text-lg font-semibold">Video Conferencia</h2>
              <Badge variant="secondary">
                {participants.length} participantes
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
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
                <Card className="p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Iniciar Video Conferencia</h3>
                  <p className="text-gray-600 mb-6">
                    Conecta con el terapeuta para comenzar la sesión
                  </p>
                  <Button
                    onClick={startVideo}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? 'Conectando...' : 'Iniciar Video'}
                  </Button>
                  {error && (
                    <p className="text-red-500 mt-2 text-sm">{error}</p>
                  )}
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
                    Tú
                  </div>
                </div>

                {/* Video Remoto */}
                <div className="relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {participants.find(p => p.role !== 'slp')?.name || 'Conectando...'}
                  </div>
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
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>

              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12 p-0"
              >
                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={endVideo}
                className="rounded-full w-12 h-12 p-0"
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

export default VideoCall;
