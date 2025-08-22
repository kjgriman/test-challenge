import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Clock, Signal } from 'lucide-react';

interface VideoCallStatusProps {
  isActive: boolean;
  sessionId?: string;
  participants?: Array<{
    id: string;
    name: string;
    role: 'slp' | 'child';
    isOnline: boolean;
  }>;
  duration?: number; // en segundos
  onJoin?: () => void;
  onLeave?: () => void;
}

const VideoCallStatus: React.FC<VideoCallStatusProps> = ({
  isActive,
  sessionId,
  participants = [],
  duration = 0,
  onJoin,
  onLeave
}) => {
  // Formatear duración
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Indicador de llamada activa */}
          <div className="relative">
            <Video className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">Videollamada Activa</h3>
            <p className="text-red-100 text-sm">
              Sesión: {sessionId || 'Sesión de Terapia'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Participantes */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {participants.length} participante{participants.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Duración */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Estado de conexión */}
          <div className="flex items-center space-x-2">
            <Signal className="w-4 h-4" />
            <span className="text-sm">Conectado</span>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            {onJoin && (
              <button
                onClick={onJoin}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors"
              >
                Unirse
              </button>
            )}
            {onLeave && (
              <button
                onClick={onLeave}
                className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm transition-colors"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de participantes */}
      {participants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-red-400">
          <h4 className="text-sm font-medium mb-2">Participantes:</h4>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1"
              >
                <div className={`w-2 h-2 rounded-full ${
                  participant.isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm">
                  {participant.name} ({participant.role})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoCallStatus;
