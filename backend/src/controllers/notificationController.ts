import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { sendSuccessResponse } from '../utils/responseUtils';
import { ValidationError, NotFoundError } from '../utils/errors';

// Obtener todas las notificaciones del usuario
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const { page = 1, limit = 20, read, type, priority } = req.query;

    let query: any = { userId };

    // Filtrar por estado de lectura
    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Filtrar por tipo
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filtrar por prioridad
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    sendSuccessResponse(res, {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      stats: {
        total,
        unread: unreadCount
      }
    }, 'Notificaciones obtenidas exitosamente');

  } catch (error) {
    next(error);
  }
};

// Marcar notificación como leída
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({ _id: notificationId, userId });

    if (!notification) {
      throw new NotFoundError('Notificación no encontrada');
    }

    notification.read = true;
    await notification.save();

    sendSuccessResponse(res, notification, 'Notificación marcada como leída');

  } catch (error) {
    next(error);
  }
};

// Marcar notificación como no leída
export const markAsUnread = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({ _id: notificationId, userId });

    if (!notification) {
      throw new NotFoundError('Notificación no encontrada');
    }

    notification.read = false;
    await notification.save();

    sendSuccessResponse(res, notification, 'Notificación marcada como no leída');

  } catch (error) {
    next(error);
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    sendSuccessResponse(res, { 
      updatedCount: result.modifiedCount 
    }, `${result.modifiedCount} notificaciones marcadas como leídas`);

  } catch (error) {
    next(error);
  }
};

// Eliminar notificación
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!notification) {
      throw new NotFoundError('Notificación no encontrada');
    }

    sendSuccessResponse(res, null, 'Notificación eliminada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const userId = req.user._id;

    const [total, unread, highPriority, today] = await Promise.all([
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false }),
      Notification.countDocuments({ userId, priority: 'high' }),
      Notification.countDocuments({
        userId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    sendSuccessResponse(res, {
      total,
      unread,
      highPriority,
      today
    }, 'Estadísticas obtenidas exitosamente');

  } catch (error) {
    next(error);
  }
};

// Crear notificación (para uso interno del sistema)
export const createNotification = async (
  userId: string,
  data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    actionText?: string;
  }
): Promise<any> => {
  try {
    const notification = new Notification({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl,
      actionText: data.actionText
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creando notificación:', error);
    throw error;
  }
};
