import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import ConnectedVideoCall from './ConnectedVideoCall';


// Tipos para las props
interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
  sessionTitle?: string;
  participants?: Array<{
    id: string;
    name: string;
    role: 'slp' | 'child';
  }>;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  sessionId = 'default-session',
  sessionTitle = 'Sesión de Terapia',
  participants = []
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [channelName, setChannelName] = useState(sessionId);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  // Actualizar channel name cuando cambie sessionId
  useEffect(() => {
    setChannelName(sessionId);
  }, [sessionId]);

  // Cargar información de la sala
  useEffect(() => {
    const loadRoomInfo = async () => {
      if (sessionId && sessionId !== 'default-session') {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/video-rooms/${sessionId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setRoomInfo(data.data);
          }
        } catch (error) {
          console.error('Error cargando información de la sala:', error);
        }
      }
    };

    loadRoomInfo();
  }, [sessionId]);

  // Manejar unirse a la llamada
  const handleJoinCall = () => {
    console.log('📞 Uniéndose a la llamada:', channelName);
    setIsJoined(true);
  };

  // Manejar salir de la llamada
  const handleLeaveCall = () => {
    console.log('📞 Saliendo de la llamada');
    setIsJoined(false);
    onClose();
  };

  // Manejar mute/unmute
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    console.log('🎤', isMuted ? 'Desmuteado' : 'Muteado');
  };

  // Manejar video on/off
  const handleToggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    console.log('📹', isVideoOff ? 'Video encendido' : 'Video apagado');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold">{sessionTitle}</h2>
                <span className="text-sm opacity-80">Sala: {channelName}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 h-full">
              {!isJoined ? (
                // Pantalla de pre-llamada
                <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {sessionTitle}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Sala de videollamada para terapia del habla
                    </p>
                    
                                         {/* Participantes */}
                     {(participants.length > 0 || (roomInfo && roomInfo.participants)) && (
                       <div className="mb-6">
                         <h4 className="text-sm font-medium text-gray-700 mb-2">
                           Participantes:
                         </h4>
                         <div className="flex flex-wrap gap-2 justify-center">
                           {(roomInfo?.participants || participants).map((participant: any, index: number) => (
                             <span
                               key={participant.userId || participant.id || index}
                               className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200 flex items-center space-x-1"
                             >
                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                               <span>{participant.name}</span>
                               <span className={`text-xs px-1 rounded ${
                                 (participant.role === 'slp' || participant.role === 'SLP') 
                                   ? 'bg-purple-100 text-purple-800' 
                                   : 'bg-green-100 text-green-800'
                               }`}>
                                 {participant.role}
                               </span>
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                    {/* Información de la sala */}
                    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Sala:</strong> {channelName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Estado:</strong> Esperando participantes
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleJoinCall}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Unirse a la Llamada</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                                                  // Pantalla de videollamada activa
                  <div className="relative h-full">
                                        {/* Usar versión conectada */}
                     <div className="h-full">
                       <ConnectedVideoCall 
                         sessionId={channelName} 
                         onClose={onClose}
                         participants={roomInfo?.participants || participants}
                       />
                     </div>

                  {/* Controles personalizados */}
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

                  {/* Indicador de estado */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Conectado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoCallModal;
