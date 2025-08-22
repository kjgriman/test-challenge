import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import VideoRoomManager from '../components/video/VideoRoomManager';
import TestVideoRoom from '../components/video/TestVideoRoom';
import VideoCallModal from '../components/video/VideoCallModal';

const VideoRooms: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  // Verificar si hay un parámetro de sala en la URL
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setCurrentRoomId(roomParam);
      setShowVideoCall(true);
    }
  }, [searchParams]);

  const handleJoinRoom = (roomId: string) => {
    console.log('📞 VideoRooms: Recibido roomId para unirse:', roomId);
    setCurrentRoomId(roomId);
    setShowVideoCall(true);
  };

  const handleCreateRoom = (sessionId: string, title: string) => {
    // La sala se crea automáticamente y se une en VideoRoomManager
    console.log('Sala creada:', { sessionId, title });
  };

  const handleCloseVideoCall = () => {
    setShowVideoCall(false);
    setCurrentRoomId(null);
    setRoomInfo(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoRoomManager
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
        />
      </div>

                     {/* Modal de videollamada */}
               <VideoCallModal
                 isOpen={showVideoCall}
                 onClose={handleCloseVideoCall}
                 sessionId={currentRoomId || 'default-session'}
                 sessionTitle={roomInfo?.title || "Sala de Terapia"}
                 participants={roomInfo?.participants || []}
               />
    </motion.div>
  );
};

export default VideoRooms;
