import * as express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} from '../controllers/notificationController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener notificaciones del usuario
router.get('/', getNotifications);

// Obtener estadísticas de notificaciones
router.get('/stats', getNotificationStats);

// Marcar notificación como leída
router.patch('/:id/read', markAsRead);

// Marcar notificación como no leída
router.patch('/:id/unread', markAsUnread);

// Marcar todas las notificaciones como leídas
router.patch('/mark-all-read', markAllAsRead);

// Eliminar notificación
router.delete('/:id', deleteNotification);

export default router;
