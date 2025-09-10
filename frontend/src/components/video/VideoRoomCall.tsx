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
  VolumeX,
  Share2,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Peer from 'peerjs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

// Declaraciones de tipos para prefijos de navegador
declare global {
  interface Navigator {
    getUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (error: Error) => void) => void;
    webkitGetUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (error: Error) => void) => void;
    mozGetUserMedia?: (constraints: MediaStreamConstraints, success: (stream: MediaStream) => void, error: (error: Error) => void) => void;
  }
  
  interface Window {
    webkitRTCPeerConnection?: new (config: RTCConfiguration) => RTCPeerConnection;
    mozRTCPeerConnection?: new (config: RTCConfiguration) => RTCPeerConnection;
  }
}

interface VideoRoomParticipant {
  userId: string;
  name: string;
  role: 'slp' | 'child' | 'guest';
  isMuted: boolean;
  isVideoOff: boolean;
  stream?: MediaStream;
}

interface VideoRoomCallProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Función de diagnóstico WebRTC ultra-simplificada
const checkWebRTCSupport = () => {
  console.log('🔍 Verificación WebRTC básica:');
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('🌐 URL:', location.href);

  // Solo verificar lo absolutamente esencial
  try {
    // Verificar HTTPS/localhost
    const isSecure = location.protocol === 'https:' || 
                     location.hostname === 'localhost' || 
                     location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      throw new Error('WebRTC requiere HTTPS o localhost');
    }

    // Verificar RTCPeerConnection de forma más directa
    let hasRTCPeerConnection = false;
    try {
      // Intentar crear una instancia para verificar si existe
      if (window.RTCPeerConnection) {
        new window.RTCPeerConnection({});
        hasRTCPeerConnection = true;
        console.log('✅ RTCPeerConnection estándar disponible');
      } else if ((window as any).webkitRTCPeerConnection) {
        new (window as any).webkitRTCPeerConnection({});
        hasRTCPeerConnection = true;
        console.log('✅ webkitRTCPeerConnection disponible');
      } else if ((window as any).mozRTCPeerConnection) {
        new (window as any).mozRTCPeerConnection({});
        hasRTCPeerConnection = true;
        console.log('✅ mozRTCPeerConnection disponible');
      }
    } catch (e) {
      console.log('⚠️ Error creando RTCPeerConnection:', e);
    }

    if (!hasRTCPeerConnection) {
      throw new Error('RTCPeerConnection no está disponible');
    }

    console.log('✅ WebRTC está soportado');
    return true;
  } catch (error) {
    console.error('❌ Error en verificación WebRTC:', error);
    throw error;
  }
};

const VideoRoomCall: React.FC<VideoRoomCallProps> = ({
  roomId,
  isOpen,
  onClose
}) => {
  const { token } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState<VideoRoomParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<any>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Configuración WebRTC mejorada
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Servidores STUN adicionales para mejor conectividad
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.ekiga.net' },
      { urls: 'stun:stun.ideasip.com' },
      { urls: 'stun:stun.schlund.de' },
      { urls: 'stun:stun.stunprotocol.org' },
      { urls: 'stun:stun.voiparound.com' },
      { urls: 'stun:stun.voipbuster.com' },
      { urls: 'stun:stun.voipstunt.com' },
      { urls: 'stun:stun.counterpath.com' },
      { urls: 'stun:stun.1und1.de' },
      { urls: 'stun:stun.gmx.net' }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
    // Configuración especial para localhost HTTP
    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
    iceGatheringPolicy: 'all' as RTCIceGatheringPolicy
  };

  // Cargar información de la sala
  const loadRoomInfo = useCallback(async () => {
    // Usar información básica de la sala sin depender del backend
    setRoomInfo({
      roomId,
      name: `Sala ${roomId}`,
      shareLink: `${window.location.origin}/video-rooms/${roomId}`
    });
  }, [roomId]);

  // Función para inicializar WebRTC de forma robusta
  const initializeWebRTC = useCallback(() => {
    console.log('🔧 Inicializando WebRTC...');
    
    // Verificar disponibilidad de APIs WebRTC
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
    
    console.log('📡 RTCPeerConnection disponible:', hasRTCPeerConnection);
    console.log('📹 getUserMedia disponible:', hasGetUserMedia);
    
    if (!hasRTCPeerConnection) {
      throw new Error('RTCPeerConnection no está disponible en este navegador');
    }
    
    if (!hasGetUserMedia) {
      throw new Error('getUserMedia no está disponible en este navegador');
    }
    
    console.log('✅ WebRTC inicializado correctamente');
    return true;
  }, []);

  // Inicializar video local con mejor manejo de errores
  const initializeLocalVideo = useCallback(async () => {
    try {
      // Inicializar WebRTC primero
      initializeWebRTC();

      console.log('🎥 Solicitando acceso a cámara y micrófono...');
      
      // Usar getUserMedia con fallback para navegadores antiguos
      let stream: MediaStream;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // API moderna
        stream = await navigator.mediaDevices.getUserMedia({
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
      } else {
        // Fallback para navegadores antiguos
        const getUserMedia = navigator.getUserMedia || 
                            navigator.webkitGetUserMedia || 
                            navigator.mozGetUserMedia;
        
        if (!getUserMedia) {
          throw new Error('getUserMedia no está disponible en este navegador');
        }
        
        stream = await new Promise<MediaStream>((resolve, reject) => {
          getUserMedia.call(navigator, {
            video: true,
            audio: true
          }, resolve, reject);
        });
      }
      
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
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Configuración de cámara no soportada.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      return null;
    }
  }, []);

  // Conectar WebSocket para la sala
  const connectSocket = useCallback(() => {
    if (!token) {
      console.error('❌ No hay token disponible para WebSocket');
      return;
    }

    console.log('🔌 Intentando conectar WebSocket...');

    // Importar Socket.IO dinámicamente
    import('socket.io-client').then(({ io }) => {
      const socket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socket.on('connect', () => {
        console.log('✅ Conectado al servidor de video');
        socket.emit('join-video-room', roomId);
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error conectando WebSocket:', error);
        setError('Error conectando al servidor: ' + error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Desconectado del servidor:', reason);
        if (reason === 'io server disconnect') {
          // El servidor desconectó, intentar reconectar
          socket.connect();
        }
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
      });

      socket.on('reconnect_error', (error) => {
        console.error('❌ Error reconectando:', error);
      });

      socket.on('video-room-participants', (participantsList: VideoRoomParticipant[]) => {
        setParticipants(participantsList);
      });

      socket.on('participant-joined-room', async (participant: VideoRoomParticipant) => {
        setParticipants(prev => [...prev, participant]);
        toast.success(`${participant.name} se ha unido a la sala`);
        
        // Crear oferta WebRTC para el nuevo participante
        if (peerConnectionRef.current && localStream) {
          try {
            console.log('🤝 Creando oferta para nuevo participante:', participant.name);
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            
            socket.emit('video-signal', {
              roomId,
              signal: offer,
              targetUserId: participant.userId
            });
          } catch (err) {
            console.error('Error creando oferta:', err);
          }
        }
      });

      socket.on('participant-left-room', (participant: VideoRoomParticipant) => {
        setParticipants(prev => prev.filter(p => p.userId !== participant.userId));
        toast(`${participant.name} ha salido de la sala`);
      });

      socket.on('video-signal', async (data: any) => {
        if (peerConnectionRef.current) {
          try {
            console.log('📡 Recibiendo señal:', data.signal.type);
            
            if (data.signal.type === 'offer') {
              // Recibir oferta y crear respuesta
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);
              
              // Enviar respuesta
              socket.emit('video-signal', {
                roomId,
                signal: answer,
                targetUserId: data.fromUserId || 'all'
              });
              
            } else if (data.signal.type === 'answer') {
              // Recibir respuesta
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.signal));
              
            } else if (data.signal.type === 'candidate') {
              // Recibir candidato ICE
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.signal));
            }
          } catch (err) {
            console.error('Error procesando señal remota:', err);
            setError('Error procesando señal WebRTC: ' + (err as Error).message);
          }
        }
      });

      socket.on('error', (errorMessage: string) => {
        setError(errorMessage);
      });

      socketRef.current = socket;
    });
  }, [token, roomId]);

  // Función de diagnóstico detallado de WebRTC
  const diagnoseWebRTC = useCallback(() => {
    console.log('🔍 === DIAGNÓSTICO DETALLADO DE WEBRTC ===');
    
    // Información del navegador
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('🔒 HTTPS:', window.location.protocol === 'https:');
    console.log('🏠 Localhost:', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    // Verificar APIs WebRTC - método más robusto
    console.log('📡 window.RTCPeerConnection:', !!window.RTCPeerConnection);
    console.log('📡 window.webkitRTCPeerConnection:', !!(window as any).webkitRTCPeerConnection);
    console.log('📡 window.mozRTCPeerConnection:', !!(window as any).mozRTCPeerConnection);
    
    // Verificar en diferentes contextos
    console.log('📡 globalThis.RTCPeerConnection:', !!globalThis.RTCPeerConnection);
    console.log('📡 self.RTCPeerConnection:', !!(self as any).RTCPeerConnection);
    
    // Verificar si está en el constructor
    console.log('📡 typeof RTCPeerConnection:', typeof RTCPeerConnection);
    console.log('📡 typeof window.RTCPeerConnection:', typeof window.RTCPeerConnection);
    
    // Verificar getUserMedia
    console.log('📹 navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('📹 navigator.mediaDevices.getUserMedia:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    console.log('📹 navigator.getUserMedia:', !!navigator.getUserMedia);
    console.log('📹 navigator.webkitGetUserMedia:', !!navigator.webkitGetUserMedia);
    console.log('📹 navigator.mozGetUserMedia:', !!navigator.mozGetUserMedia);
    
    // Verificar otras APIs
    console.log('🎯 navigator.getDisplayMedia:', !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia));
    console.log('📊 RTCRtpSender:', !!window.RTCRtpSender);
    console.log('📊 RTCRtpReceiver:', !!window.RTCRtpReceiver);
    
    // Intentar crear RTCPeerConnection con diferentes métodos
    try {
      // Método 1: Directo
      if (window.RTCPeerConnection) {
        const pc = new window.RTCPeerConnection();
        console.log('✅ RTCPeerConnection creado exitosamente (método 1)');
        pc.close();
      }
      
      // Método 2: Con globalThis
      if (globalThis.RTCPeerConnection) {
        const pc = new globalThis.RTCPeerConnection();
        console.log('✅ RTCPeerConnection creado exitosamente (método 2)');
        pc.close();
      }
      
      // Método 3: Con self
      if ((self as any).RTCPeerConnection) {
        const pc = new (self as any).RTCPeerConnection();
        console.log('✅ RTCPeerConnection creado exitosamente (método 3)');
        pc.close();
      }
      
      // Método 4: Con prefijos
      if ((window as any).webkitRTCPeerConnection) {
        const pc = new (window as any).webkitRTCPeerConnection({});
        console.log('✅ webkitRTCPeerConnection creado exitosamente');
        pc.close();
      }
      
      if ((window as any).mozRTCPeerConnection) {
        const pc = new (window as any).mozRTCPeerConnection({});
        console.log('✅ mozRTCPeerConnection creado exitosamente');
        pc.close();
      }
      
      // Si llegamos aquí sin crear ninguna conexión
      console.error('❌ Ninguna implementación de RTCPeerConnection disponible');
      
    } catch (error) {
      console.error('❌ Error creando RTCPeerConnection:', error);
    }
    
    console.log('🔍 === FIN DEL DIAGNÓSTICO ===');
  }, []);

  // Función de diagnóstico adicional para problemas específicos
  const diagnoseBrowserIssues = useCallback(() => {
    console.log('🔍 === DIAGNÓSTICO ADICIONAL DE NAVEGADOR ===');
    
    // Verificar si hay algún problema con la configuración
    console.log('🌐 window.location:', window.location.href);
    console.log('🔒 window.isSecureContext:', window.isSecureContext);
    console.log('📱 navigator.platform:', navigator.platform);
    console.log('🌐 navigator.language:', navigator.language);
    
    // Verificar políticas de seguridad
    console.log('🛡️ Permissions API:', !!navigator.permissions);
    console.log('🛡️ Service Worker:', !!navigator.serviceWorker);
    
    // Verificar si hay algún problema con el contexto de ejecución
    console.log('⚙️ typeof window:', typeof window);
    console.log('⚙️ typeof globalThis:', typeof globalThis);
    console.log('⚙️ typeof self:', typeof self);
    
    // Verificar si hay algún problema con el constructor
    try {
      console.log('🔧 RTCPeerConnection constructor:', RTCPeerConnection);
    } catch (e) {
      console.log('❌ Error accediendo a RTCPeerConnection constructor:', e);
    }
    
    // Verificar si hay algún problema con el prototipo
    try {
      console.log('🔧 RTCPeerConnection.prototype:', RTCPeerConnection.prototype);
    } catch (e) {
      console.log('❌ Error accediendo a RTCPeerConnection.prototype:', e);
    }
    
    // Verificar si hay algún problema con el contexto de ejecución
    try {
      console.log('🔧 eval("RTCPeerConnection"):', eval('RTCPeerConnection'));
    } catch (e) {
      console.log('❌ Error con eval("RTCPeerConnection"):', e);
    }
    
    console.log('🔍 === FIN DEL DIAGNÓSTICO ADICIONAL ===');
  }, []);

  // Función alternativa usando PeerJS como fallback
  const startVideoWithPeerJS = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🎥 Iniciando video con PeerJS...');
      
      // Inicializar video local
      const stream = await initializeLocalVideo();
      if (!stream) return;

      console.log('✅ Video local inicializado');

      // Crear Peer con PeerJS
      const peer = new Peer({
        host: 'localhost',
        port: 3001,
        path: '/peerjs',
        secure: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
          ]
        }
      });

      peer.on('open', (id) => {
        console.log('✅ PeerJS conectado con ID:', id);
        setIsVideoEnabled(true);
        toast.success('Video conferencia iniciada con PeerJS');
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
      });

      peer.on('error', (err) => {
        console.error('❌ Error en PeerJS:', err);
        setError('Error en PeerJS: ' + err.message);
      });

      // Guardar referencia del peer
      peerConnectionRef.current = peer as any;

    } catch (err) {
      console.error('Error iniciando video con PeerJS:', err);
      setError('Error al iniciar video con PeerJS: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, [initializeLocalVideo]);

  // Función alternativa usando PeerJS con servidor público
  const startVideoWithPeerJSPublic = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🎥 Iniciando video con PeerJS (servidor público)...');
      
      // Inicializar video local
      const stream = await initializeLocalVideo();
      if (!stream) return;

      console.log('✅ Video local inicializado');

      // Crear Peer con servidor público de PeerJS
      const peer = new Peer({
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
      });

      peer.on('open', (id) => {
        console.log('✅ PeerJS conectado con ID:', id);
        setIsVideoEnabled(true);
        toast.success('Video conferencia iniciada con PeerJS (servidor público)');
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
      });

      peer.on('error', (err) => {
        console.error('❌ Error en PeerJS:', err);
        setError('Error en PeerJS: ' + err.message);
      });

      // Guardar referencia del peer
      peerConnectionRef.current = peer as any;

    } catch (err) {
      console.error('Error iniciando video con PeerJS público:', err);
      setError('Error al iniciar video con PeerJS público: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, [initializeLocalVideo]);

  // Iniciar video con WebRTC real (versión simplificada)
  const startVideo = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('🎥 Iniciando video...');
      
      // Ejecutar diagnóstico primero
      diagnoseWebRTC();
      
      // Inicializar video local
      const stream = await initializeLocalVideo();
      if (!stream) return;

      console.log('✅ Video local inicializado');

      // Intentar conectar WebSocket (opcional)
      try {
        connectSocket();
        console.log('✅ WebSocket conectado');
      } catch (wsError) {
        console.warn('⚠️ WebSocket no disponible, continuando sin señalización:', wsError);
        // Continuar sin WebSocket para pruebas
      }

      // Crear conexión WebRTC - enfoque simplificado y robusto
      let peerConnection: RTCPeerConnection;
      
      console.log('🔍 Verificando disponibilidad de RTCPeerConnection...');
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌐 URL:', window.location.href);
      console.log('🔒 Protocolo:', window.location.protocol);
      
      // Verificar todas las posibles implementaciones
      const RTCPeerConnectionClass = 
        window.RTCPeerConnection || 
        (window as any).webkitRTCPeerConnection || 
        (window as any).mozRTCPeerConnection ||
        (globalThis as any).RTCPeerConnection ||
        (self as any).RTCPeerConnection;
      
      console.log('📡 RTCPeerConnectionClass encontrada:', !!RTCPeerConnectionClass);
      console.log('📡 window.RTCPeerConnection:', !!window.RTCPeerConnection);
      console.log('📡 webkitRTCPeerConnection:', !!(window as any).webkitRTCPeerConnection);
      console.log('📡 mozRTCPeerConnection:', !!(window as any).mozRTCPeerConnection);
      
      if (!RTCPeerConnectionClass) {
        console.error('❌ RTCPeerConnection no está disponible');
        console.error('🔍 Verificaciones adicionales:');
        console.error('   - typeof RTCPeerConnection:', typeof RTCPeerConnection);
        console.error('   - typeof window.RTCPeerConnection:', typeof window.RTCPeerConnection);
        console.error('   - window.RTCPeerConnection:', window.RTCPeerConnection);
        throw new Error('RTCPeerConnection no está disponible en este navegador. Verifica que estés usando un navegador moderno con soporte WebRTC.');
      }
      
      try {
        peerConnection = new RTCPeerConnectionClass(rtcConfig);
        console.log('✅ RTCPeerConnection creado exitosamente');
      } catch (error) {
        console.error('❌ Error creando RTCPeerConnection:', error);
        throw new Error('Error creando conexión WebRTC: ' + (error as Error).message);
      }
      
      peerConnectionRef.current = peerConnection;

      // Agregar stream local
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Manejar candidatos ICE (solo si WebSocket está disponible)
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log('📡 Enviando candidato ICE:', event.candidate);
          socketRef.current.emit('video-signal', {
            roomId,
            signal: event.candidate,
            targetUserId: 'all'
          });
        }
      };

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {
        console.log('📹 Stream remoto recibido:', event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Manejar cambios de estado de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Estado de conexión:', peerConnection.connectionState);
        setConnectionState(peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          toast.success('Conexión WebRTC establecida');
        } else if (peerConnection.connectionState === 'failed') {
          setError('Error en la conexión WebRTC');
        } else if (peerConnection.connectionState === 'disconnected') {
          toast('Conexión WebRTC desconectada');
        }
      };

      // Manejar cambios de estado ICE
      peerConnection.oniceconnectionstatechange = () => {
        console.log('🧊 Estado ICE:', peerConnection.iceConnectionState);
      };

      setIsVideoEnabled(true);
      toast.success('Video conferencia iniciada');

    } catch (err) {
      console.error('Error iniciando video:', err);
      setError('Error al iniciar video: ' + (err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, initializeLocalVideo, connectSocket, diagnoseWebRTC]);

  // Terminar video
  const endVideo = useCallback(async () => {
    try {
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
      onClose();

    } catch (err) {
      console.error('Error terminando video:', err);
    }
  }, [localStream, onClose]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Notificar al servidor
        if (socketRef.current) {
          socketRef.current.emit('participant-update-room', {
            roomId,
            isMuted: !audioTrack.enabled
          });
        }
      }
    }
  }, [localStream, roomId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Notificar al servidor
        if (socketRef.current) {
          socketRef.current.emit('participant-update-room', {
            roomId,
            isVideoOff: !videoTrack.enabled
          });
        }
      }
    }
  }, [localStream, roomId]);

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

  // Copiar enlace de la sala
  const copyRoomLink = useCallback(() => {
    if (roomInfo?.shareLink) {
      navigator.clipboard.writeText(roomInfo.shareLink);
      toast.success('Enlace copiado al portapapeles');
    }
  }, [roomInfo]);

  // Cargar información de la sala al abrir
  useEffect(() => {
    if (isOpen) {
      loadRoomInfo();
    }
  }, [isOpen, loadRoomInfo]);

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
                {roomInfo?.name || 'Sala de Video'}
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
              {roomInfo?.roomId && (
                <Badge variant="outline" className="font-mono text-xs">
                  {roomInfo.roomId}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomLink}
                title="Copiar enlace"
              >
                <Copy size={16} />
              </Button>
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
                  <h3 className="text-xl font-semibold mb-4">Unirse a Video Conferencia</h3>
                  <p className="text-gray-600 mb-6">
                    Activa tu cámara y micrófono para unirte a la sala
                  </p>
                  <Button
                    onClick={diagnoseWebRTC}
                    variant="outline"
                    className="w-full mb-2"
                    size="sm"
                  >
                    🔍 Diagnosticar WebRTC
                  </Button>
                  <Button
                    onClick={diagnoseBrowserIssues}
                    variant="outline"
                    className="w-full mb-2"
                    size="sm"
                  >
                    🔧 Diagnosticar Navegador
                  </Button>
                  <Button
                    onClick={startVideo}
                    disabled={isConnecting}
                    className="w-full mb-2"
                    size="lg"
                  >
                    {isConnecting ? 'Conectando...' : 'Activar Video y Audio (WebRTC)'}
                  </Button>
                  <Button
                    onClick={startVideoWithPeerJS}
                    disabled={isConnecting}
                    variant="secondary"
                    className="w-full mb-2"
                    size="lg"
                  >
                    {isConnecting ? 'Conectando...' : 'Activar Video y Audio (PeerJS Local)'}
                  </Button>
                  <Button
                    onClick={startVideoWithPeerJSPublic}
                    disabled={isConnecting}
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    {isConnecting ? 'Conectando...' : 'Activar Video y Audio (PeerJS Público)'}
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
                    {participants.find(p => p.userId !== 'local')?.name || 'Esperando participantes...'}
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

export default VideoRoomCall;
