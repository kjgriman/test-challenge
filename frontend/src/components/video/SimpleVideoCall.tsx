import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, AlertCircle } from 'lucide-react';

interface SimpleVideoCallProps {
  sessionId: string;
  onClose: () => void;
}

const SimpleVideoCall: React.FC<SimpleVideoCallProps> = ({ sessionId, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Inicializar video al montar
  useEffect(() => {
    const initVideo = async () => {
      try {
        // Solicitar acceso a cámara y micrófono
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error('Error accediendo a cámara/micrófono:', err);
        setError('No se pudo acceder a la cámara o micrófono. Verifica los permisos.');
      }
    };

    initVideo();

    // Cleanup al desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Manejar mute/unmute
  const handleToggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!isMuted);
      }
    }
  };

  // Manejar video on/off
  const handleToggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  // Manejar salir de la llamada
  const handleLeaveCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-2">
            Error de Acceso
          </h3>
          <p className="text-red-700 mb-6">{error}</p>
          <div className="bg-white rounded-lg p-4 mb-6 border border-red-200">
            <p className="text-sm text-red-600">
              <strong>Solución:</strong> Permite acceso a cámara y micrófono
            </p>
            <p className="text-sm text-red-600">
              <strong>Alternativa:</strong> Usa Chrome o Firefox actualizado
            </p>
          </div>
        </div>
        <button onClick={onClose} className="btn-outline">
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black">
      {/* Video principal */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />

      {/* Overlay de información */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2 text-white text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Conectado - Sala: {sessionId}</span>
        </div>
      </div>

      {/* Controles */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
        <button
          onClick={handleToggleMute}
          className={`p-3 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-500 text-white' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={handleToggleVideo}
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

      {/* Mensaje de demo */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
        <h3 className="text-white text-lg font-semibold mb-2">Demo de Videollamada</h3>
        <p className="text-gray-300 text-sm">
          Esta es una versión de demostración.<br />
          En producción se usaría Agora.io para videollamadas reales.
        </p>
      </div>
    </div>
  );
};

export default SimpleVideoCall;
