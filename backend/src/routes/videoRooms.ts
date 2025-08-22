import express from 'express';
import { authenticate } from '../middleware/auth';
import { asyncErrorHandler } from '../middleware/asyncErrorHandler';
import {
  createVideoRoom,
  getVideoRoom,
  joinVideoRoom,
  leaveVideoRoom,
  getUserVideoRooms,
  closeVideoRoom
} from '../controllers/videoRoomController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear nueva sala
router.post('/', asyncErrorHandler(createVideoRoom));

// Obtener salas del usuario
router.get('/my-rooms', asyncErrorHandler(getUserVideoRooms));

// Obtener sala específica
router.get('/:roomId', asyncErrorHandler(getVideoRoom));

// Unirse a una sala
router.post('/:roomId/join', asyncErrorHandler(joinVideoRoom));

// Salir de una sala
router.post('/:roomId/leave', asyncErrorHandler(leaveVideoRoom));

// Cerrar sala (solo creador)
router.delete('/:roomId', asyncErrorHandler(closeVideoRoom));

export default router;
