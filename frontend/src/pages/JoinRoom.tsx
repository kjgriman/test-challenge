import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Hash, Users, Video, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const JoinRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const { apiRequest } = useAuthStore();

  // Obtener código de la URL si existe
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setRoomId(code);
      checkRoom(code);
    }
  }, [searchParams]);

  // Verificar si la sala existe
  const checkRoom = async (id: string = roomId) => {
    if (!id.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(`/video-rooms/${id}`, 'GET');
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
      
      // Redirigir a la videollamada
      navigate(`/video-rooms?room=${roomId}`);
    } catch (error: any) {
      setError(error.message || 'Error al unirse a la sala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/video-rooms')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-primary-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unirse a Sala
          </h1>
          <p className="text-gray-600">
            Ingresa el código de invitación para unirte a una sesión de terapia
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Invitación
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
                onClick={() => checkRoom()}
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
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/video-rooms')}
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

        {/* Instrucciones */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿No tienes un código? Pídeselo a tu terapeuta
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default JoinRoom;
