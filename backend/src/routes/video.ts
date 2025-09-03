import * as express from 'express';
import { authenticate } from '../middleware/auth';
import {
  startVideoSession,
  joinVideoSession,
  leaveVideoSession,
  endVideoSession,
  getVideoSessionInfo
} from '../controllers/videoController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de video para sesiones
router.post('/sessions/:sessionId/start-video', startVideoSession);
router.post('/sessions/:sessionId/join-video', joinVideoSession);
router.post('/sessions/:sessionId/leave-video', leaveVideoSession);
router.post('/sessions/:sessionId/end-video', endVideoSession);
router.get('/sessions/:sessionId/video-info', getVideoSessionInfo);

export default router;
