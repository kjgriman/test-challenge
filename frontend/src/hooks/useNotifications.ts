import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  today: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    highPriority: 0,
    today: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al cargar las notificaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.data.total || 0,
          unread: data.data.unread || 0,
          highPriority: data.data.highPriority || 0,
          today: data.data.today || 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, [token]);

  // Marcar como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
        // Recargar estadísticas
        await loadStats();
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  // Marcar como no leída
  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}/unread`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: false }
              : notif
          )
        );
        // Recargar estadísticas
        await loadStats();
      }
    } catch (error) {
      console.error('Error marcando como no leída:', error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Recargar estadísticas
        await loadStats();
      }
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        // Recargar estadísticas
        await loadStats();
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  // Obtener notificaciones no leídas
  const unreadNotifications = notifications.filter(notif => !notif.read);

  // Obtener notificaciones recientes (últimas 5)
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadNotifications();
      loadStats();
    }
  }, [token, loadNotifications, loadStats]);

  return {
    notifications,
    stats,
    loading,
    error,
    unreadNotifications,
    recentNotifications,
    loadNotifications,
    loadStats,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    formatRelativeTime
  };
};
