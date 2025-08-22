import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Users, Hash, Check } from 'lucide-react';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomTitle: string;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomTitle
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Unirse a ${roomTitle}`,
          text: `Únete a mi sala de terapia: ${roomTitle}`,
          url: `${window.location.origin}/join-room?code=${roomId}`
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      copyToClipboard();
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
                ¡Sala Creada!
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-6">
              {/* Información de la sala */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {roomTitle}
                </h4>
                <p className="text-gray-600">
                  Tu sala está lista para recibir estudiantes
                </p>
              </div>

              {/* Código de invitación */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Código de Invitación:
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm">
                    {roomId}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-md transition-colors ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-green-600 mt-2"
                  >
                    ¡Código copiado!
                  </motion.p>
                )}
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">
                  ¿Cómo invitar a un estudiante?
                </h5>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Comparte el código con tu estudiante</li>
                  <li>2. El estudiante va a "Unirse a Sala"</li>
                  <li>3. Pega el código y haz clic en "Unirse"</li>
                  <li>4. ¡Ambos estarán en la misma videollamada!</li>
                </ol>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <button
                  onClick={shareRoom}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
                <button
                  onClick={onClose}
                  className="btn-outline flex-1"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteCodeModal;
