import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

// Tipos para la videollamada
interface VideoCallState {
  isActive: boolean;
  sessionId: string | null;
  participants: Array<{
    id: string;
    name: string;
    role: 'slp' | 'child';
    isOnline: boolean;
  }>;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface UseVideoCallReturn {
  videoCallState: VideoCallState;
  startVideoCall: (sessionId: string, sessionTitle?: string) => void;
  joinVideoCall: (sessionId: string) => void;
  leaveVideoCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  updateParticipants: (participants: VideoCallState['participants']) => void;
}

const useVideoCall = (): UseVideoCallReturn => {
  const { user } = useAuthStore();
  
  const [videoCallState, setVideoCallState] = useState<VideoCallState>({
    isActive: false,
    sessionId: null,
    participants: [],
    isMuted: false,
    isVideoOff: false,
  });

  // Iniciar una nueva videollamada
  const startVideoCall = useCallback((sessionId: string, sessionTitle?: string) => {
    console.log('📞 Iniciando videollamada para sesión:', sessionId);
    
    const currentUser = {
      id: user?._id || 'unknown',
      name: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.email || 'Usuario',
      role: user?.role as 'slp' | 'child',
      isOnline: true,
    };

    setVideoCallState({
      isActive: true,
      sessionId,
      participants: [currentUser],
      isMuted: false,
      isVideoOff: false,
    });

    // Aquí podrías emitir un evento WebSocket para notificar a otros participantes
    // socket.emit('video-call-started', { sessionId, initiator: currentUser });
  }, [user]);

  // Unirse a una videollamada existente
  const joinVideoCall = useCallback((sessionId: string) => {
    console.log('📞 Uniéndose a videollamada:', sessionId);
    
    const currentUser = {
      id: user?._id || 'unknown',
      name: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.email || 'Usuario',
      role: user?.role as 'slp' | 'child',
      isOnline: true,
    };

    setVideoCallState(prev => ({
      ...prev,
      isActive: true,
      sessionId,
      participants: [...prev.participants, currentUser],
    }));

    // Aquí podrías emitir un evento WebSocket para notificar a otros participantes
    // socket.emit('video-call-joined', { sessionId, participant: currentUser });
  }, [user]);

  // Salir de la videollamada
  const leaveVideoCall = useCallback(() => {
    console.log('📞 Saliendo de videollamada');
    
    setVideoCallState({
      isActive: false,
      sessionId: null,
      participants: [],
      isMuted: false,
      isVideoOff: false,
    });

    // Aquí podrías emitir un evento WebSocket para notificar a otros participantes
    // socket.emit('video-call-left', { sessionId: videoCallState.sessionId, participant: currentUser });
  }, []);

  // Alternar mute/unmute
  const toggleMute = useCallback(() => {
    setVideoCallState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  }, []);

  // Alternar video on/off
  const toggleVideo = useCallback(() => {
    setVideoCallState(prev => ({
      ...prev,
      isVideoOff: !prev.isVideoOff,
    }));
  }, []);

  // Actualizar lista de participantes
  const updateParticipants = useCallback((participants: VideoCallState['participants']) => {
    setVideoCallState(prev => ({
      ...prev,
      participants,
    }));
  }, []);

  return {
    videoCallState,
    startVideoCall,
    joinVideoCall,
    leaveVideoCall,
    toggleMute,
    toggleVideo,
    updateParticipants,
  };
};

export default useVideoCall;
