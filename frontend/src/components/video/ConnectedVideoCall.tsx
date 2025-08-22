import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Users, Settings } from 'lucide-react';
import { useVideoRoom } from '../../hooks/useVideoRoom';

interface ConnectedVideoCallProps {
  sessionId: string;
  onClose: () => void;
  participants: Array<{
    userId: string;
    name: string;
    role: 'slp' | 'child';
  }>;
}

const ConnectedVideoCall: React.FC<ConnectedVideoCallProps> = ({
  sessionId,
  onClose,
  participants
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Usar el hook de la sala de video
  const {
    participants: roomParticipants,
    isConnected,
    error: roomError,
    leaveRoom,
    toggleMute: roomToggleMute,
    toggleVideo: roomToggleVideo
  } = useVideoRoom(sessionId);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<RTCPeerConnection[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Configuración de WebRTC
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Inicializar videollamada
  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, [sessionId]);

  const initializeCall = async () => {
    try {
      // Obtener stream local
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simular conexión con otros participantes
      setTimeout(() => {
        // Simular streams remotos (en una implementación real, estos vendrían de otros usuarios)
        simulateRemoteParticipants();
      }, 2000);

    } catch (error) {
      console.error('Error accediendo a cámara/micrófono:', error);
      // El error se maneja a través del hook useVideoRoom
    }
  };

  const simulateRemoteParticipants = () => {
    // En una implementación real, esto se conectaría con otros usuarios
    // Por ahora, simulamos que hay otros participantes
    console.log('Conectando con otros participantes...');
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current = [];
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        roomToggleMute(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        roomToggleVideo(!videoTrack.enabled);
      }
    }
  };

  const handleLeaveCall = () => {
    cleanup();
    leaveRoom();
    onClose();
  };

  if (roomError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Error de Conexión</h3>
          <p className="text-gray-300 mb-6">{roomError}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <h2 className="text-white font-semibold">Sala: {sessionId}</h2>
                         <span className="text-gray-300 text-sm">
               {roomParticipants.length} participantes
             </span>
          </div>
          <button
            onClick={handleLeaveCall}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="h-full pt-16 pb-20">
        {!isConnected ? (
          // Pantalla de conexión
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Phone className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Conectando...</h3>
            <p className="text-gray-300">Estableciendo conexión con otros participantes</p>
          </div>
        ) : (
          // Pantalla de videollamada
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full">
            {/* Video local */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                Tú (Local)
              </div>
              {isMuted && (
                <div className="absolute top-2 right-2 bg-red-500 p-1 rounded">
                  <MicOff className="w-4 h-4 text-white" />
                </div>
              )}
              {isVideoOff && (
                <div className="absolute top-2 right-2 bg-red-500 p-1 rounded">
                  <VideoOff className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

                         {/* Videos remotos reales */}
             {roomParticipants.slice(0, 5).map((participant, index) => (
               <div key={participant.userId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                   <div className="text-center text-white">
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                       <Users className="w-8 h-8" />
                     </div>
                     <p className="font-semibold">{participant.name}</p>
                     <p className="text-sm opacity-75">{participant.role}</p>
                   </div>
                 </div>
                 <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                   {participant.name}
                 </div>
                 <div className="absolute top-2 right-2 bg-green-500 p-1 rounded">
                   <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          <button
            onClick={handleLeaveCall}
            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Indicador de estado */}
      <div className="absolute top-20 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2 text-white text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span>{isConnected ? 'Conectado' : 'Conectando...'}</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectedVideoCall;
