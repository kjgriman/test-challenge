import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

interface VideoRoomParticipant {
  userId: string;
  name: string;
  role: 'slp' | 'child';
  isActive: boolean;
  joinedAt: Date;
}

interface VideoRoomState {
  roomId: string;
  title: string;
  participants: VideoRoomParticipant[];
  isConnected: boolean;
  error: string | null;
}

export const useVideoRoom = (roomId: string) => {
  const [state, setState] = useState<VideoRoomState>({
    roomId,
    title: '',
    participants: [],
    isConnected: false,
    error: null
  });

  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!roomId || !user) {
      console.log('❌ useVideoRoom: No roomId o user:', { roomId, user });
      return;
    }

    console.log('🚀 useVideoRoom: Conectando a sala:', roomId, 'usuario:', user.firstName);

    // Conectar al Socket.io
    const connectToRoom = () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.error('❌ No hay token de autenticación');
          setState(prev => ({ 
            ...prev, 
            error: 'No hay token de autenticación',
            isConnected: false 
          }));
          return;
        }

        const socket = io('http://localhost:3001', {
          transports: ['websocket'],
          autoConnect: true,
          auth: {
            token: token
          }
        });

        socket.on('connect', () => {
          console.log('🔌 Conectado al Socket.io de la sala:', roomId);
          setState(prev => ({ ...prev, isConnected: true, error: null }));

          // Unirse a la sala de video
          const joinData = {
            roomId,
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role
          };
          console.log('📤 Enviando join_video_room:', joinData);
          socket.emit('join_video_room', joinData);
        });

        socket.on('room_info', (data) => {
          console.log('📥 Recibido room_info:', data);
          handleWebSocketMessage({ type: 'room_info', ...data });
        });

        socket.on('participant_joined', (data) => {
          console.log('📥 Recibido participant_joined:', data);
          handleWebSocketMessage({ type: 'participant_joined', ...data });
        });

        socket.on('participant_left', (data) => {
          console.log('📥 Recibido participant_left:', data);
          handleWebSocketMessage({ type: 'participant_left', ...data });
        });

        socket.on('participant_updated', (data) => {
          console.log('📥 Recibido participant_updated:', data);
          handleWebSocketMessage({ type: 'participant_updated', ...data });
        });

        socket.on('error', (data) => {
          console.error('❌ Socket.io error:', data);
          setState(prev => ({ 
            ...prev, 
            error: data.message || 'Error de conexión con la sala',
            isConnected: false 
          }));
        });

        socket.on('disconnect', () => {
          console.log('🔌 Desconectado del Socket.io');
          setState(prev => ({ ...prev, isConnected: false }));
        });

        socketRef.current = socket;
      } catch (error) {
        console.error('Error connecting to Socket.io:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'No se pudo conectar a la sala',
          isConnected: false 
        }));
      }
    };

    connectToRoom();

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [roomId, user]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'room_info':
        setState(prev => ({
          ...prev,
          title: data.title,
          participants: data.participants
        }));
        break;

      case 'participant_joined':
        setState(prev => ({
          ...prev,
          participants: [...prev.participants, data.participant]
        }));
        break;

      case 'participant_left':
        setState(prev => ({
          ...prev,
          participants: prev.participants.filter(p => p.userId !== data.userId)
        }));
        break;

      case 'participant_updated':
        setState(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.userId === data.userId ? { ...p, ...data.updates } : p
          )
        }));
        break;

      default:
        console.log('Mensaje WebSocket no manejado:', data);
    }
  };

  const sendMessage = (type: string, payload: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(type, payload);
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_video_room');
      socketRef.current.disconnect();
    }
  };

  const toggleMute = (isMuted: boolean) => {
    sendMessage('toggle_mute', { userId: user?.id, isMuted });
  };

  const toggleVideo = (isVideoOff: boolean) => {
    sendMessage('toggle_video', { userId: user?.id, isVideoOff });
  };

  return {
    ...state,
    sendMessage,
    leaveRoom,
    toggleMute,
    toggleVideo
  };
};
