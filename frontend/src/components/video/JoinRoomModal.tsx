import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash, Users, Video, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom
}) => {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const { apiRequest } = useAuthStore();

  // Verificar si la sala existe
  const checkRoom = async () => {
    if (!roomId.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/video-rooms/${roomId}`, 'GET');
      setRoomInfo(response.data);
    } catch (error: any) {
      setError(error.message || 'Sala no encontrada');
      setRoomInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Unirse a la sala
  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;

    try {
      setLoading(true);
      await apiRequest(`/video-rooms/${roomId}/join`, 'POST');
      onJoinRoom(roomId);
      onClose();
      setRoomId('');
      setRoomInfo(null);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Error al unirse a la sala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Unirse a Sala
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID de la Sala
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkRoom()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: room_1234567890_abc123"
                  />
                  <button
                    onClick={checkRoom}
                    disabled={!roomId.trim() || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Verificar
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Información de la sala */}
              {roomInfo && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Video className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">
                      {roomInfo.title}
                    </h4>
                  </div>
                  
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono">{roomInfo.roomId}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {roomInfo.participants.length} / {roomInfo.maxParticipants} participantes
                      </span>
                    </div>

                    {roomInfo.participants.length > 0 && (
                      <div>
                        <span className="font-medium">Participantes:</span>
                        <div className="mt-1 space-y-1">
                          {roomInfo.participants.map((participant: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{participant.name}</span>
                              <span className={`text-xs px-1 rounded ${
                                participant.role === 'slp' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {participant.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomInfo || loading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uniéndose...' : 'Unirse a la Sala'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinRoomModal;
