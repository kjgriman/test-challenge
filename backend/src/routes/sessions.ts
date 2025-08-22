import { Router } from 'express';
import { authenticate, isSLP } from '../middleware/auth';
import { asyncErrorHandler } from '../middleware/asyncErrorHandler';
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  joinSession,
  leaveSession,
  startSession,
  endSession,
  getSessionParticipants
} from '../controllers/sessionController';

const router = Router();

// Rutas para sesiones (requieren autenticación)
router.use(authenticate);

// CRUD básico
router.post('/', isSLP, asyncErrorHandler(createSession));
router.get('/', asyncErrorHandler(getSessions));
router.get('/:id', asyncErrorHandler(getSessionById));
router.put('/:id', isSLP, asyncErrorHandler(updateSession));
router.delete('/:id', isSLP, asyncErrorHandler(deleteSession));

// Gestión de sesiones
router.post('/:id/join', asyncErrorHandler(joinSession));
router.post('/:id/leave', asyncErrorHandler(leaveSession));
router.post('/:id/start', isSLP, asyncErrorHandler(startSession));
router.post('/:id/end', isSLP, asyncErrorHandler(endSession));
router.get('/:id/participants', asyncErrorHandler(getSessionParticipants));

export default router;
