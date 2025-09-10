import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Users, Settings, Copy, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface CreateVideoRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (room: any) => void;
}

interface RoomSettings {
  allowScreenShare: boolean;
  allowChat: boolean;
  allowRecording: boolean;
  requireApproval: boolean;
}

const CreateVideoRoomModal: React.FC<CreateVideoRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated
}) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxParticipants: 10
  });
  const [settings, setSettings] = useState<RoomSettings>({
    allowScreenShare: true,
    allowChat: true,
    allowRecording: false,
    requireApproval: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre de la sala es requerido');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://test-challenge-production.up.railway.app/api/video-rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            settings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear la sala');
      }

      const data = await response.json();
      toast.success('Sala creada exitosamente');
      onRoomCreated(data.data.videoRoom);
      handleClose();
    } catch (error) {
      toast.error('Error al crear la sala');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      maxParticipants: 10
    });
    setSettings({
      allowScreenShare: true,
      allowChat: true,
      allowRecording: false,
      requireApproval: false
    });
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Enlace copiado al portapapeles');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Crear Nueva Sala de Video</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información de la Sala</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la sala *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Sesión de Terapia - Juan"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el propósito de esta sala..."
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de participantes
                  </label>
                  <select
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5 participantes</option>
                    <option value={10}>10 participantes</option>
                    <option value={15}>15 participantes</option>
                    <option value={20}>20 participantes</option>
                    <option value={30}>30 participantes</option>
                    <option value={50}>50 participantes</option>
                  </select>
                </div>
              </div>

              {/* Configuración */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Compartir pantalla</p>
                      <p className="text-xs text-gray-500">Permitir a los participantes compartir su pantalla</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowScreenShare}
                      onChange={(e) => setSettings({ ...settings, allowScreenShare: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Chat</p>
                      <p className="text-xs text-gray-500">Permitir mensajes de texto durante la sesión</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowChat}
                      onChange={(e) => setSettings({ ...settings, allowChat: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Grabación</p>
                      <p className="text-xs text-gray-500">Permitir grabar la sesión</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.allowRecording}
                      onChange={(e) => setSettings({ ...settings, allowRecording: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Aprobación requerida</p>
                      <p className="text-xs text-gray-500">El creador debe aprobar nuevos participantes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireApproval}
                      onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Share2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Información importante</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Se generará automáticamente un identificador único para la sala</li>
                      <li>• Podrás compartir el enlace con otros participantes</li>
                      <li>• Solo tú podrás iniciar y finalizar la sala</li>
                      <li>• Los participantes pueden unirse usando el enlace compartido</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="flex-1"
                >
                  {loading ? 'Creando...' : 'Crear Sala'}
                </Button>
              </div>
            </form>
          </CardContent>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateVideoRoomModal;
