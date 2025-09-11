import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import gameController, { getGames, getGameProgress, getGameAchievements } from '../controllers/gameController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Aplicar rate limiting
router.use(rateLimiter);

// Obtener lista de juegos disponibles (sin autenticación para prueba)
router.get('/', getGames);

// Aplicar autenticación a las rutas que la requieren
router.use(authenticate);

// Obtener progreso del usuario en juegos
router.get('/progress', getGameProgress);

// Obtener logros del usuario
router.get('/achievements', getGameAchievements);

// Unirse a una sesión de juego
router.post('/join', gameController.joinGameSession);

// Procesar evento de juego
router.post('/event', gameController.processGameEvent);

// Obtener estado del juego
router.get('/state/:sessionId', gameController.getGameState);

// Salir de la sesión de juego
router.delete('/leave/:sessionId', gameController.leaveGameSession);

export default router;
