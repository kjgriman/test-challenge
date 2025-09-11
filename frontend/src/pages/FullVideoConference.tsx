import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface VideoRoom {
  id: string;
  name: string;
  participantCount: number;
  createdAt: Date;
}

interface Participant {
  userId: string;
  userEmail: string;
}

const FullVideoConference: React.FC = () => {
  const { user, apiRequest } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webrtcStatus, setWebrtcStatus] = useState<string>('Verificando...');

  // Referencias para video
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Configuración WebRTC robusta
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
    iceGatheringPolicy: 'all' as RTCIceGatheringPolicy
  };

  // Verificar WebRTC al cargar
  useEffect(() => {
    const checkWebRTC = () => {
      const hasRTCPeerConnection = !!(
        window.RTCPeerConnection || 
        (window as any).webkitRTCPeerConnection || 
        (window as any).mozRTCPeerConnection
      );

      const hasGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        navigator.getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia
      );

      if (hasRTCPeerConnection && hasGetUserMedia) {
        setWebrtcStatus('✅ WebRTC Disponible');
        return true;
      } else {
        setWebrtcStatus('❌ WebRTC No Disponible');
        return false;
      }
    };

    checkWebRTC();
  }, []);

  // Conectar WebSocket
  const connectSocket = useCallback(() => {
    if (socket) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }

    // Usar HTTP para desarrollo local
    const serverUrl = import.meta.env.VITE_API_URL;

    const newSocket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
      setError(null);
      toast.success('Conectado al servidor');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
      toast.error('Desconectado del servidor');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error conexión WebSocket:', error);
      setError(`Error de conexión: ${error.message}`);
      toast.error('Error conectando al servidor');
    });

    // Eventos de salas
    newSocket.on('room-created', (data) => {
      console.log('🏠 Sala creada:', data);
      toast.success(`Sala "${data.roomName}" creada`);
      loadRooms();
    });

    newSocket.on('joined-room', (data) => {
      console.log('👤 Unido a sala:', data);
      setCurrentRoom(data.roomId);
      setParticipants(data.participants.map((p: string) => ({ userId: p, userEmail: 'Usuario' })));
      toast.success(`Unido a la sala "${data.roomName}"`);
    });

    newSocket.on('user-joined', (data) => {
      console.log('👤 Usuario se unió:', data);
      setParticipants(prev => [...prev, { userId: data.userId, userEmail: data.userEmail }]);
      toast.success(`${data.userEmail} se unió a la sala`);
    });

    newSocket.on('user-left', (data) => {
      console.log('👤 Usuario salió:', data);
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
      toast.info(`${data.userEmail} salió de la sala`);
    });

    newSocket.on('video-rooms-list', (data) => {
      console.log('📋 Lista de salas:', data);
      setRooms(data.rooms);
    });

    // Eventos WebRTC
    newSocket.on('webrtc-offer', async (data) => {
      console.log('📡 Recibida oferta WebRTC:', data);
      await handleWebRTCOffer(data.offer);
    });

    newSocket.on('webrtc-answer', async (data) => {
      console.log('📡 Recibida respuesta WebRTC:', data);
      await handleWebRTCAnswer(data.answer);
    });

    newSocket.on('webrtc-ice-candidate', async (data) => {
      console.log('🧊 Recibido ICE candidate:', data);
      await handleICECandidate(data.candidate);
    });

    setSocket(newSocket);
  }, [socket]);

  // Cargar salas disponibles
  const loadRooms = useCallback(() => {
    if (socket) {
      socket.emit('get-video-rooms');
    }
  }, [socket]);

  // Crear nueva sala
  const createRoom = useCallback(() => {
    if (!socket || !roomName.trim()) return;

    socket.emit('create-video-room', { roomName: roomName.trim() });
    setRoomName('');
  }, [socket, roomName]);

  // Unirse a sala
  const joinRoom = useCallback((roomId: string) => {
    if (!socket) return;

    socket.emit('join-video-room', { roomId });
  }, [socket]);

  // Salir de sala
  const leaveRoom = useCallback(() => {
    if (!socket || !currentRoom) return;

    socket.emit('leave-video-room', { roomId: currentRoom });
    setCurrentRoom(null);
    setParticipants([]);
    setIsCallActive(false);
    
    // Cerrar conexión WebRTC
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Detener stream local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    toast.info('Saliste de la sala');
  }, [socket, currentRoom]);

  // Iniciar video
  const startVideo = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no está disponible');
      }

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

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      localStreamRef.current = stream;
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      toast.success('Video iniciado');

    } catch (error) {
      console.error('Error iniciando video:', error);
      toast.error(`Error iniciando video: ${(error as Error).message}`);
    }
  }, []);

  // Detener video
  const stopVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    toast.info('Video detenido');
  }, []);

  // Crear conexión WebRTC
  const createPeerConnection = useCallback(() => {
    if (!socket || !currentRoom) return;

    // Verificar si RTCPeerConnection está disponible
    const RTCPeerConnectionClass = window.RTCPeerConnection || 
                                  (window as any).webkitRTCPeerConnection || 
                                  (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnectionClass) {
      console.error('❌ RTCPeerConnection no está disponible');
      toast.error('RTCPeerConnection no está disponible');
      return;
    }

    const peerConnection = new RTCPeerConnectionClass(rtcConfig);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Enviando ICE candidate');
        socket.emit('webrtc-ice-candidate', {
          roomId: currentRoom,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('📹 Stream remoto recibido');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        toast.success('Video remoto conectado');
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Estado de conexión: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'connected') {
        setIsCallActive(true);
        toast.success('Videoconferencia establecida');
      } else if (peerConnection.connectionState === 'failed') {
        setIsCallActive(false);
        toast.error('Conexión WebRTC falló');
      }
    };

    peerConnectionRef.current = peerConnection;
    console.log('✅ Conexión WebRTC creada');
  }, [socket, currentRoom]);

  // Manejar oferta WebRTC
  const handleWebRTCOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      createPeerConnection();
    }

    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(offer);
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      if (socket && currentRoom) {
        socket.emit('webrtc-answer', {
          roomId: currentRoom,
          answer
        });
      }
    }
  }, [socket, currentRoom, createPeerConnection]);

  // Manejar respuesta WebRTC
  const handleWebRTCAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(answer);
    }
  }, []);

  // Manejar ICE candidate
  const handleICECandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(candidate);
    }
  }, []);

  // Iniciar llamada WebRTC
  const startCall = useCallback(async () => {
    if (!socket || !currentRoom || !localStreamRef.current) return;

    createPeerConnection();

    if (peerConnectionRef.current && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, localStreamRef.current!);
      });

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit('webrtc-offer', {
        roomId: currentRoom,
        offer
      });

      toast.success('Llamada iniciada');
    }
  }, [socket, currentRoom, createPeerConnection]);

  // Efectos
  useEffect(() => {
    connectSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [connectSocket]);

  useEffect(() => {
    if (isConnected) {
      loadRooms();
    }
  }, [isConnected, loadRooms]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎥 Sistema Completo de Videoconferencias</CardTitle>
            <p className="text-gray-600">
              Sistema full con WebRTC real, salas dinámicas y videoconferencias en tiempo real
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estado del sistema */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium">{webrtcStatus}</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isCallActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {isCallActive ? 'Llamada Activa' : 'Sin Llamada'}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Crear nueva sala */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Crear Nueva Sala</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de la sala"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <Button onClick={createRoom} disabled={!isConnected || !roomName.trim()}>
                  Crear Sala
                </Button>
              </div>
            </div>

            {/* Salas disponibles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Salas Disponibles</h3>
              <div className="grid gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{room.name}</h4>
                        <p className="text-sm text-gray-600">
                          {room.participantCount} participantes
                        </p>
                      </div>
                      <Button
                        onClick={() => joinRoom(room.id)}
                        disabled={!isConnected || currentRoom === room.id}
                      >
                        {currentRoom === room.id ? 'En Sala' : 'Unirse'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sala actual */}
            {currentRoom && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sala Activa</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-semibold">Videoconferencia Activa</h4>
                      <p className="text-sm text-gray-600">
                        {participants.length} participantes
                      </p>
                    </div>
                    <Button onClick={leaveRoom} variant="destructive">
                      Salir de Sala
                    </Button>
                  </div>

                  {/* Controles de video */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      onClick={startVideo}
                      disabled={isVideoEnabled}
                      variant={isVideoEnabled ? "secondary" : "default"}
                    >
                      {isVideoEnabled ? 'Video Activo' : 'Iniciar Video'}
                    </Button>
                    <Button
                      onClick={stopVideo}
                      disabled={!isVideoEnabled}
                      variant="outline"
                    >
                      Detener Video
                    </Button>
                    <Button
                      onClick={startCall}
                      disabled={!isVideoEnabled || isCallActive}
                      variant="default"
                    >
                      {isCallActive ? 'Llamada Activa' : 'Iniciar Llamada'}
                    </Button>
                  </div>

                  {/* Videos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label>Tu Video</Label>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-64 bg-gray-200 rounded-md"
                      />
                    </div>
                    <div>
                      <Label>Video Remoto</Label>
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 bg-gray-200 rounded-md"
                      />
                    </div>
                  </div>

                  {/* Participantes */}
                  <div className="mt-4">
                    <Label>Participantes</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {participants.map((participant) => (
                        <div key={participant.userId} className="px-3 py-1 bg-blue-100 rounded-full text-sm">
                          {participant.userEmail}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FullVideoConference;
