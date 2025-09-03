import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { TherapySession } from '../models/TherapySession';

// Tipos de notificaciones del sistema
export enum NotificationType {
  SESSION_CREATED = 'session_created',
  SESSION_STARTED = 'session_started',
  SESSION_COMPLETED = 'session_completed',
  SESSION_CANCELLED = 'session_cancelled',
  SESSION_REMINDER = 'session_reminder',
  STUDENT_ASSIGNED = 'student_assigned',
  SYSTEM_UPDATE = 'system_update',
  PROGRESS_UPDATE = 'progress_update'
}

// Interfaz para datos de notificación
interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

// Servicio de notificaciones
export class NotificationService {
  // Crear notificación para un usuario específico
  static async createNotification(
    userId: string,
    data: NotificationData
  ): Promise<any> {
    try {
      const notification = new Notification({
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        actionUrl: data.actionUrl,
        actionText: data.actionText
      });

      await notification.save();
      console.log(`🔔 Notificación creada para usuario ${userId}: ${data.title}`);
      return notification;
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  }

  // Crear notificación para múltiples usuarios
  static async createNotificationForUsers(
    userIds: string[],
    data: NotificationData
  ): Promise<any[]> {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        actionUrl: data.actionUrl,
        actionText: data.actionText
      }));

      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`🔔 Notificaciones creadas para ${userIds.length} usuarios: ${data.title}`);
      return createdNotifications;
    } catch (error) {
      console.error('❌ Error creando notificaciones múltiples:', error);
      throw error;
    }
  }

  // Notificación de sesión creada
  static async notifySessionCreated(sessionId: string): Promise<void> {
    try {
      const session = await TherapySession.findById(sessionId)
        .populate('childId', 'firstName lastName')
        .populate('slpId', 'firstName lastName');

      if (!session) return;

      const childName = `${(session.childId as any).firstName} ${(session.childId as any).lastName}`;
      const slpName = `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`;
      const sessionDate = new Date(session.scheduledDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notificar al niño
      await this.createNotification(session.childId._id.toString(), {
        title: 'Nueva sesión programada',
        message: `Se ha programado una nueva sesión de terapia con ${slpName} para el ${sessionDate}`,
        type: 'info',
        priority: 'medium',
        actionUrl: '/sessions',
        actionText: 'Ver sesión'
      });

      // Notificar al SLP
      await this.createNotification(session.slpId._id.toString(), {
        title: 'Sesión programada exitosamente',
        message: `Se ha programado una sesión con ${childName} para el ${sessionDate}`,
        type: 'success',
        priority: 'low',
        actionUrl: '/sessions',
        actionText: 'Ver sesión'
      });

    } catch (error) {
      console.error('❌ Error notificando sesión creada:', error);
    }
  }

  // Notificación de sesión iniciada
  static async notifySessionStarted(sessionId: string): Promise<void> {
    try {
      const session = await TherapySession.findById(sessionId)
        .populate('childId', 'firstName lastName')
        .populate('slpId', 'firstName lastName');

      if (!session) return;

      const childName = `${(session.childId as any).firstName} ${(session.childId as any).lastName}`;
      const slpName = `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`;

      // Notificar al niño
      await this.createNotification(session.childId._id.toString(), {
        title: 'Sesión iniciada',
        message: `${slpName} ha iniciado la sesión de terapia. ¡Es hora de comenzar!`,
        type: 'info',
        priority: 'high',
        actionUrl: '/sessions/active',
        actionText: 'Unirse ahora'
      });

      // Notificar al SLP
      await this.createNotification(session.slpId._id.toString(), {
        title: 'Sesión iniciada',
        message: `Has iniciado la sesión con ${childName}. La sesión está activa.`,
        type: 'success',
        priority: 'medium',
        actionUrl: '/sessions/active',
        actionText: 'Ver sesión'
      });

    } catch (error) {
      console.error('❌ Error notificando sesión iniciada:', error);
    }
  }

  // Notificación de sesión completada
  static async notifySessionCompleted(sessionId: string, accuracy?: number): Promise<void> {
    try {
      const session = await TherapySession.findById(sessionId)
        .populate('childId', 'firstName lastName')
        .populate('slpId', 'firstName lastName');

      if (!session) return;

      const childName = `${(session.childId as any).firstName} ${(session.childId as any).lastName}`;
      const slpName = `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`;
      const accuracyText = accuracy ? ` con un ${accuracy}% de precisión` : '';

      // Notificar al niño
      await this.createNotification(session.childId._id.toString(), {
        title: 'Sesión completada',
        message: `¡Excelente trabajo! Has completado la sesión con ${slpName}${accuracyText}.`,
        type: 'success',
        priority: 'low',
        actionUrl: '/sessions/history',
        actionText: 'Ver detalles'
      });

      // Notificar al SLP
      await this.createNotification(session.slpId._id.toString(), {
        title: 'Sesión completada exitosamente',
        message: `La sesión con ${childName} se ha completado${accuracyText}.`,
        type: 'success',
        priority: 'low',
        actionUrl: '/sessions/history',
        actionText: 'Ver detalles'
      });

    } catch (error) {
      console.error('❌ Error notificando sesión completada:', error);
    }
  }

  // Notificación de sesión cancelada
  static async notifySessionCancelled(sessionId: string, reason?: string): Promise<void> {
    try {
      const session = await TherapySession.findById(sessionId)
        .populate('childId', 'firstName lastName')
        .populate('slpId', 'firstName lastName');

      if (!session) return;

      const childName = `${(session.childId as any).firstName} ${(session.childId as any).lastName}`;
      const slpName = `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`;
      const reasonText = reason ? ` Motivo: ${reason}` : '';

      // Notificar al niño
      await this.createNotification(session.childId._id.toString(), {
        title: 'Sesión cancelada',
        message: `La sesión programada con ${slpName} ha sido cancelada.${reasonText}`,
        type: 'warning',
        priority: 'medium',
        actionUrl: '/sessions',
        actionText: 'Ver sesiones'
      });

      // Notificar al SLP
      await this.createNotification(session.slpId._id.toString(), {
        title: 'Sesión cancelada',
        message: `La sesión con ${childName} ha sido cancelada.${reasonText}`,
        type: 'warning',
        priority: 'medium',
        actionUrl: '/sessions',
        actionText: 'Ver sesiones'
      });

    } catch (error) {
      console.error('❌ Error notificando sesión cancelada:', error);
    }
  }

  // Notificación de recordatorio de sesión (para sesiones próximas)
  static async notifySessionReminder(sessionId: string): Promise<void> {
    try {
      const session = await TherapySession.findById(sessionId)
        .populate('childId', 'firstName lastName')
        .populate('slpId', 'firstName lastName');

      if (!session) return;

      const childName = `${(session.childId as any).firstName} ${(session.childId as any).lastName}`;
      const slpName = `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`;
      const sessionTime = new Date(session.scheduledDate).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Notificar al niño
      await this.createNotification(session.childId._id.toString(), {
        title: 'Recordatorio de sesión',
        message: `Tienes una sesión programada con ${slpName} a las ${sessionTime}. ¡Prepárate!`,
        type: 'warning',
        priority: 'high',
        actionUrl: '/sessions',
        actionText: 'Ver sesión'
      });

      // Notificar al SLP
      await this.createNotification(session.slpId._id.toString(), {
        title: 'Recordatorio de sesión',
        message: `Tienes una sesión programada con ${childName} a las ${sessionTime}.`,
        type: 'warning',
        priority: 'high',
        actionUrl: '/sessions',
        actionText: 'Ver sesión'
      });

    } catch (error) {
      console.error('❌ Error notificando recordatorio de sesión:', error);
    }
  }

  // Notificación de nuevo estudiante asignado
  static async notifyStudentAssigned(slpId: string, childId: string): Promise<void> {
    try {
      const [slp, child] = await Promise.all([
        User.findById(slpId),
        User.findById(childId)
      ]);

      if (!slp || !child) return;

      const childName = `${child.firstName} ${child.lastName}`;
      const slpName = `${slp.firstName} ${slp.lastName}`;

      // Notificar al SLP
      await this.createNotification(slpId, {
        title: 'Nuevo estudiante asignado',
        message: `Se te ha asignado un nuevo estudiante: ${childName}. Revisa su perfil para comenzar la evaluación.`,
        type: 'info',
        priority: 'medium',
        actionUrl: '/students',
        actionText: 'Ver perfil'
      });

      // Notificar al niño
      await this.createNotification(childId, {
        title: 'Terapeuta asignado',
        message: `Se te ha asignado un nuevo terapeuta: ${slpName}. Pronto tendrás tu primera sesión.`,
        type: 'info',
        priority: 'medium',
        actionUrl: '/sessions',
        actionText: 'Ver sesiones'
      });

    } catch (error) {
      console.error('❌ Error notificando estudiante asignado:', error);
    }
  }

  // Notificación de progreso destacado
  static async notifyProgressUpdate(childId: string, progress: string): Promise<void> {
    try {
      const child = await User.findById(childId);
      if (!child) return;

      const childName = `${child.firstName} ${child.lastName}`;

      // Notificar al niño
      await this.createNotification(childId, {
        title: '¡Progreso destacado!',
        message: `¡Felicitaciones! Has mostrado un progreso excepcional: ${progress}`,
        type: 'success',
        priority: 'medium',
        actionUrl: '/sessions/history',
        actionText: 'Ver progreso'
      });

    } catch (error) {
      console.error('❌ Error notificando progreso:', error);
    }
  }

  // Notificación de actualización del sistema
  static async notifySystemUpdate(userIds: string[], update: string): Promise<void> {
    try {
      await this.createNotificationForUsers(userIds, {
        title: 'Actualización del sistema',
        message: update,
        type: 'info',
        priority: 'low'
      });

    } catch (error) {
      console.error('❌ Error notificando actualización del sistema:', error);
    }
  }
}
