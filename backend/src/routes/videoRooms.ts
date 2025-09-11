import * as express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createVideoRoom,
  getVideoRooms,
  getVideoRoom,
  joinVideoRoom,
  startVideoRoom,
  endVideoRoom,
  leaveVideoRoom,
  deleteVideoRoom,
  updateVideoRoomSettings,
  inviteToVideoRoom,
  acceptVideoRoomInvitation,
  joinPublicVideoRoom
} from '../controllers/videoRoomController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear una nueva sala de video
router.post('/', createVideoRoom);

// Obtener todas las salas de video del usuario
router.get('/', getVideoRooms);

// Obtener una sala de video específica
router.get('/:roomId', getVideoRoom);

// Unirse a una sala de video
router.post('/:roomId/join', joinVideoRoom);

// Iniciar una sala de video
router.post('/:roomId/start', startVideoRoom);

// Finalizar una sala de video
router.post('/:roomId/end', endVideoRoom);

// Salir de una sala de video
router.post('/:roomId/leave', leaveVideoRoom);

// Eliminar una sala de video
router.delete('/:roomId', deleteVideoRoom);

// Actualizar configuración de la sala
router.put('/:roomId/settings', updateVideoRoomSettings);

// Invitar usuario a sala de video
router.post('/:roomId/invite', inviteToVideoRoom);

// Aceptar invitación a sala de video
router.post('/:roomId/accept-invitation', acceptVideoRoomInvitation);

// Unirse a sala pública por código
router.post('/:roomId/join-public', joinPublicVideoRoom);

export default router;
