import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Play, 
  Square, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Copy, 
  Share2, 
  Settings,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  User,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuthStore } from '../store/authStore';
import VideoCall from '../components/video/VideoCall';
import CreateVideoRoomModal from '../components/modals/CreateVideoRoomModal';
import { toast } from 'react-hot-toast';
import VideoRoomCall from '../components/video/VideoRoomCall';

interface VideoSession {
  _id: string;
  sessionType: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  videoEnabled: boolean;
  videoStartedAt?: string;
  videoEndedAt?: string;
  videoParticipants: Array<{
    userId: string;
    name: string;
    role: string;
    joinedAt: string;
    isActive: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
  }>;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  slpId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  notes?: string;
  gamesPlayed?: string[];
  accuracy?: number;
}

interface VideoRoom {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  participants: Array<{
    userId: {
      id: string;
      firstName: string;
      lastName: string;
    };
    name: string;
    role: 'slp' | 'child' | 'guest';
    joinedAt: string;
    isActive: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
  }>;
  settings: {
    allowScreenShare: boolean;
    allowChat: boolean;
    allowRecording: boolean;
    requireApproval: boolean;
  };
  shareLink: string;
  createdAt: string;
  updatedAt: string;
}

const VideoRooms: React.FC = () => {
  const { token } = useAuthStore();
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [videoRooms, setVideoRooms] = useState<VideoRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'sessions' | 'rooms'>('rooms');
  // Estado para modales
  const [videoCallModal, setVideoCallModal] = useState<{
    isOpen: boolean;
    sessionId: string | null;
    roomId?: string | null;
  }>({ isOpen: false, sessionId: null, roomId: null });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar sesiones con video
  const loadVideoSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las sesiones');
      }

      const data = await response.json();
      
      // Filtrar solo sesiones que tienen video habilitado o están en progreso
      const videoSessions = data.data.sessions.filter((session: VideoSession) => 
        session.videoEnabled || session.status === 'in_progress'
      );
      setSessions(videoSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar las sesiones de video');
    } finally {
      setLoading(false);
    }
  };

  // Cargar salas de video independientes
  const loadVideoRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video-rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las salas de video');
      }

      const data = await response.json();
      console.log('xxxxxxxxxxxxxxx', data.data.videoRooms);
      
      setVideoRooms(data.data.videoRooms);
    } catch (err) {
      console.error('Error al cargar salas de video:', err);
      // No mostrar error toast para salas de video ya que pueden no existir
    }
  };

  useEffect(() => {
    loadVideoSessions();
    loadVideoRooms();
  }, [token]);

  // Unirse a una sala de video independiente
  const joinVideoRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video-rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al unirse a la sala');
      }

      toast.success('Te has unido a la sala exitosamente');
      loadVideoRooms();
      // Aquí podrías abrir el modal de video o redirigir a la sala
      openVideoCall('', roomId);
    } catch (err) {
      toast.error('Error al unirse a la sala');
    }
  };

  // Abrir modal de video
  const openVideoCall = (sessionId: string, roomId?: string) => {
    console.log('🔓 Abriendo modal de video:', { sessionId, roomId });
    setVideoCallModal({ isOpen: true, sessionId, roomId });
  };

  // Cerrar modal de video
  const closeVideoCall = () => {
    console.log('🔒 Cerrando modal de video');
    // setVideoCallModal({ isOpen: false, sessionId: null, roomId: null });
  };

  // Manejar sala creada
  const handleRoomCreated = (room: VideoRoom) => {
    setVideoRooms(prev => [room, ...(prev || [])]);
    toast.success(`Sala "${room.name}" creada exitosamente`);
    console.log('salas created', room);
    
  };

  // Copiar enlace de la sala
  const copyRoomLink = (shareLink: string) => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Enlace copiado al portapapeles');
  };

  // Iniciar sala de video
  const startVideoRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video-rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al iniciar la sala');
      }

      toast.success('Sala iniciada exitosamente');
      loadVideoRooms();
    } catch (err) {
      toast.error('Error al iniciar la sala');
    }
  };

  // Finalizar sala de video
  const endVideoRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video-rooms/${roomId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al finalizar la sala');
      }

      toast.success('Sala finalizada exitosamente');
      loadVideoRooms();
    } catch (err) {
      toast.error('Error al finalizar la sala');
    }
  };

  // Iniciar video para una sesión
  const startVideoSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video/sessions/${sessionId}/start-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al iniciar la sesión de video');
      }

      toast.success('Sesión de video iniciada');
      loadVideoSessions();
    } catch (err) {
      toast.error('Error al iniciar la sesión de video');
    }
  };

  // Finalizar video para una sesión
  const endVideoSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/video/sessions/${sessionId}/end-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al finalizar la sesión de video');
      }

      toast.success('Sesión de video finalizada');
      loadVideoSessions();
    } catch (err) {
      toast.error('Error al finalizar la sesión de video');
    }
  };

  // Filtrar sesiones
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.childId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.childId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.slpId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.slpId.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Obtener estado del video
  const getVideoStatus = (session: VideoSession) => {
    if (session.videoStartedAt && !session.videoEndedAt) {
      return 'active';
    } else if (session.videoEnabled) {
      return 'ready';
    } else {
      return 'disabled';
    }
  };

  // Obtener color del badge según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadVideoSessions}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Salas de Videoconferencia</h1>
            <p className="text-gray-600">
              Gestiona todas las sesiones de video conferencia y únete a las sesiones activas
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Crear Sala
          </Button>
        </div>

        {/* Pestañas */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mis Salas ({videoRooms?.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sesiones ({sessions.length})
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por estudiante o terapeuta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los estados</option>
          <option value="scheduled">Programadas</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
        <Button onClick={loadVideoSessions} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Contenido condicional */}
      {activeTab === 'rooms' ? (
        <>
          {/* Estadísticas de salas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Video className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total de salas</p>
                    <p className="text-2xl font-bold">{videoRooms?.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Play className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Salas activas</p>
                    <p className="text-2xl font-bold">
                      {videoRooms?.filter(room => room.isActive)?.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Participantes</p>
                    <p className="text-2xl font-bold">
                      {videoRooms?.reduce((total, room) => total + room.participants.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Creadas hoy</p>
                    <p className="text-2xl font-bold">
                      {videoRooms?.filter(room => {
                        const today = new Date().toDateString();
                        return new Date(room.createdAt).toDateString() === today;
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de salas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {videoRooms?.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`h-full ${room.isActive ? 'ring-2 ring-green-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate">
                        {room.name}
                      </CardTitle>
                      <Badge className={room.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {room.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Descripción */}
                    {room.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    {/* Información de participantes */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <Users className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium">Participantes:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {room.participants.filter(p => p.isActive).length}/{room.maxParticipants}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creada por: {room.createdBy.firstName} {room.createdBy.lastName}
                      </div>
                    </div>

                    {/* Configuración */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {room.settings.allowScreenShare && (
                          <Badge variant="outline" className="text-xs">Pantalla</Badge>
                        )}
                        {room.settings.allowChat && (
                          <Badge variant="outline" className="text-xs">Chat</Badge>
                        )}
                        {room.settings.allowRecording && (
                          <Badge variant="outline" className="text-xs">Grabar</Badge>
                        )}
                        {room.settings.requireApproval && (
                          <Badge variant="outline" className="text-xs">Aprobación</Badge>
                        )}
                      </div>
                    </div>

                    {/* Información de tiempo */}
                    <div className="mb-4 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Creada: {new Date(room.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {room.startedAt && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            Iniciada: {new Date(room.startedAt).toLocaleTimeString('es-ES')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {room.isActive ? (
                        <Button 
                          onClick={() => joinVideoRoom(room.roomId)}
                          className="flex-1"
                          size="sm"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Unirsessss
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => startVideoRoom(room.roomId)}
                          className="flex-1"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => copyRoomLink(room.shareLink)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      {room.isActive && (
                        <Button 
                          onClick={() => endVideoRoom(room.roomId)}
                          variant="destructive"
                          size="sm"
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mensaje cuando no hay salas */}
          {videoRooms?.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay salas de video creadas
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primera sala de video para comenzar a colaborar
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Sala
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Estadísticas de sesiones */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Video className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total de sesiones</p>
                    <p className="text-2xl font-bold">{sessions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Play className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Video activo</p>
                    <p className="text-2xl font-bold">
                      {sessions.filter(s => getVideoStatus(s) === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Participantes</p>
                    <p className="text-2xl font-bold">
                      {sessions.reduce((total, s) => total + s.videoParticipants.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Tiempo total</p>
                    <p className="text-2xl font-bold">
                      {Math.round(sessions.reduce((total, s) => total + (s.duration || 0), 0) / 60)}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de sesiones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
              const videoStatus = getVideoStatus(session);
              const isActive = videoStatus === 'active';
              const canJoin = session.status === 'in_progress' && session.videoEnabled;
              
              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`h-full ${isActive ? 'ring-2 ring-green-500' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {session.sessionType}
                        </CardTitle>
                        <Badge className={getStatusColor(videoStatus)}>
                          {videoStatus === 'active' ? 'En vivo' : 
                           videoStatus === 'ready' ? 'Listo' : 'Deshabilitado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Información de participantes */}
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <User className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">Participantes:</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <span className="font-medium">Terapeuta:</span>
                            <span className="ml-2">
                              {session.slpId.firstName} {session.slpId.lastName}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="font-medium">Estudiante:</span>
                            <span className="ml-2">
                              {session.childId.firstName} {session.childId.lastName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estado de video */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Estado de video:</span>
                          <Badge variant="outline" className={getStatusColor(videoStatus)}>
                            {videoStatus === 'active' ? 'Activo' : 
                             videoStatus === 'ready' ? 'Disponible' : 'No disponible'}
                          </Badge>
                        </div>
                      </div>

                      {/* Información de tiempo */}
                      <div className="mb-4 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(session.startTime).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(session.startTime).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {session.endTime && ` - ${new Date(session.endTime).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`}
                          </span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        {canJoin && (
                          <Button 
                            onClick={() => openVideoCall(session._id)}
                            className="flex-1"
                            size="sm"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Unirse
                          </Button>
                        )}
                        
                        {session.status === 'in_progress' && !isActive && session.videoEnabled && (
                          <Button 
                            onClick={() => startVideoSession(session._id)}
                            variant="outline"
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar
                          </Button>
                        )}
                        
                        {isActive && (
                          <Button 
                            onClick={() => endVideoSession(session._id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Finalizar
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => openVideoCall(session._id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mensaje cuando no hay sesiones */}
          {filteredSessions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay sesiones de video disponibles
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Las sesiones de video aparecerán aquí cuando estén disponibles'
                  }
                </p>
                <Button onClick={loadVideoSessions} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de creación de sala */}
      <CreateVideoRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onRoomCreated={handleRoomCreated}
      />

      {/* Modal de video para sesiones */}
      {videoCallModal.sessionId && videoCallModal.isOpen && (
        <VideoCall
          sessionId={videoCallModal?.sessionId}
          isOpen={videoCallModal.isOpen}
          onClose={() => closeVideoCall()}
          onStartVideo={() => videoCallModal.sessionId && startVideoSession(videoCallModal.sessionId)}
          onEndVideo={() => videoCallModal.sessionId && endVideoSession(videoCallModal.sessionId)}
        />
      )}
      {/* Modal de video para salas independientes */}
      {videoCallModal.roomId && videoCallModal.isOpen && (
        <VideoRoomCall
          roomId={videoCallModal.roomId}
          isOpen={videoCallModal.isOpen}
          onClose={() => closeVideoCall()}
        />
      )}
    </div>
  );
};

export default VideoRooms;
