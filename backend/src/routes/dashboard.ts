const express = require('express');
import { authenticate } from '../middleware/auth';
import {
  getDashboardStats,
  getRecentSessions,
  getUpcomingSessions,
  getCaseload
} from '../controllers/dashboardController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener estadísticas del dashboard
router.get('/stats', getDashboardStats);

// Obtener sesiones recientes
router.get('/recent-sessions', getRecentSessions);

// Obtener próximas sesiones
router.get('/upcoming-sessions', getUpcomingSessions);

// Obtener caseload (solo para SLP)
router.get('/caseload', getCaseload);

export default router;
