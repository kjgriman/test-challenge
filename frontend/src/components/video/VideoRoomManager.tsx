import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Video, 
  Copy, 
  Trash2, 
  Settings,
  User,
  UserCheck,
  Clock,
  Hash,
  LogIn
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import JoinRoomModal from './JoinRoomModal';
import InviteCodeModal from './InviteCodeModal';

interface VideoRoom {
  roomId: string;
  sessionId: string;
  title: string;
  participants: Array<{
    userId: string;
    name: string;
    role: 'slp' | 'child';
    joinedAt: string;
    isActive: boolean;
  }>;
  isCreator: boolean;
}

interface VideoRoomManagerProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (sessionId: string, title: string) => void;
  onStartGame: () => void;
}

const VideoRoomManager: React.FC<VideoRoomManagerProps> = ({
  onJoinRoom,
  onCreateRoom,
  onStartGame
}) => {
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    sessionId: '',
    title: ''
  });
  const [createdRoom, setCreatedRoom] = useState<{ roomId: string; title: string } | null>(null);
  const { apiRequest, user, isAuthenticated } = useAuthStore();

  // Cargar salas del usuario
  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/video-rooms/my-rooms', 'GET');
      setRooms(response.data);
    } catch (error) {
      console.error('❌ Error cargando salas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Crear nueva sala
  const handleCreateRoom = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }
      
      const response = await apiRequest('/video-rooms', 'POST', {
        sessionId: newRoomData.sessionId,
        title: newRoomData.title
      });

      setRooms(prev => [...prev, response.data]);
      setShowCreateModal(false);
      setNewRoomData({ sessionId: '', title: '' });
      
      // Mostrar modal de invitación
      setCreatedRoom({
        roomId: response.data.roomId,
        title: response.data.title
      });
      setShowInviteModal(true);
    } catch (error) {
      console.error('Error creando sala:', error);
    }
  };

  // Unirse a sala existente
  const handleJoinRoom = async (roomId: string) => {
    try {
      console.log('🔄 Uniéndose a sala:', roomId);
      await apiRequest(`/video-rooms/${roomId}/join`, 'POST');
      console.log('✅ Unido a sala exitosamente, llamando onJoinRoom con:', roomId);
      onJoinRoom(roomId);
    } catch (error) {
      console.error('Error uniéndose a sala:', error);
    }
  };

  // Cerrar sala
  const handleCloseRoom = async (roomId: string) => {
    try {
      await apiRequest(`/video-rooms/${roomId}`, 'DELETE');
      setRooms(prev => prev.filter(room => room.roomId !== roomId));
    } catch (error) {
      console.error('Error cerrando sala:', error);
    }
  };

  // Copiar roomId al portapapeles
  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    // TODO: Mostrar notificación de éxito
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Cargando salas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Salas de Videoconferencia</h2>
          <p className="text-gray-600">Gestiona tus sesiones de terapia virtual</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-outline flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Unirse a Sala</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sala</span>
          </button>
        </div>
      </div>

      {/* Lista de salas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes salas activas
            </h3>
            <p className="text-gray-600 mb-4">
              Crea una nueva sala para comenzar una sesión de terapia
            </p>
                         <div className="flex space-x-3 justify-center">
               <button
                 onClick={() => setShowJoinModal(true)}
                 className="btn-outline"
               >
                 Unirse a Sala
               </button>
               <button
                 onClick={() => setShowCreateModal(true)}
                 className="btn-primary"
               >
                 Crear Primera Sala
               </button>
             </div>
          </div>
        ) : (
          rooms.map((room) => (
            <motion.div
              key={room.roomId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header de la sala */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {room.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono">{room.roomId}</span>
                  </div>
                </div>
                {room.isCreator && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Creador
                  </span>
                )}
              </div>

              {/* Participantes */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4" />
                  <span>{room.participants.length} participantes</span>
                </div>
                <div className="space-y-1">
                  {room.participants.slice(0, 3).map((participant, index) => (
                    <div key={`${participant.userId}-${index}`} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        participant.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="text-sm text-gray-700">
                        {participant.name}
                      </span>
                      <span className={`text-xs px-1 rounded ${
                        participant.role === 'slp' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {participant.role}
                      </span>
                    </div>
                  ))}
                  {room.participants.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{room.participants.length - 3} más
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleJoinRoom(room.roomId)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Unirse</span>
                </button>
                <button
                  onClick={onStartGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  title="Iniciar Juego"
                >
                  <span className="text-lg">🎮</span>
                  <span className="text-sm">Juego</span>
                </button>
                <button
                  onClick={() => copyRoomId(room.roomId)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar ID de sala"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {room.isCreator && (
                  <button
                    onClick={() => handleCloseRoom(room.roomId)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Cerrar sala"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal para crear sala */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Crear Nueva Sala
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la Sala
                  </label>
                  <input
                    type="text"
                    value={newRoomData.title}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Sesión de Terapia - Juan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de Sesión (opcional)
                  </label>
                  <input
                    type="text"
                    value={newRoomData.sessionId}
                    onChange={(e) => setNewRoomData(prev => ({ ...prev, sessionId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Dejar vacío para generar automáticamente"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoomData.title.trim()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Sala
                </button>
              </div>
            </motion.div>
          </motion.div>
                 )}
       </AnimatePresence>

       {/* Modal para unirse a sala */}
       <JoinRoomModal
         isOpen={showJoinModal}
         onClose={() => setShowJoinModal(false)}
         onJoinRoom={onJoinRoom}
       />

       {/* Modal de código de invitación */}
       {createdRoom && (
         <InviteCodeModal
           isOpen={showInviteModal}
           onClose={() => {
             setShowInviteModal(false);
             setCreatedRoom(null);
           }}
           roomId={createdRoom.roomId}
           roomTitle={createdRoom.title}
         />
       )}
     </div>
   );
 };

export default VideoRoomManager;
