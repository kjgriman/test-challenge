import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { TherapySession } from '../models/TherapySession';
import { sendSuccessResponse } from '../utils/responseUtils';

// Clase de error simple para evitar problemas de importación
class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Interfaz para las estadísticas del dashboard
interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalStudents: number;
  gamesPlayed: number;
  averageAccuracy: number;
  totalTime: number;
}

// Interfaz para sesiones recientes
interface RecentSession {
  id: string;
  studentName: string;
  date: string;
  duration: string;
  accuracy: number;
  status: 'completed' | 'active' | 'scheduled';
}

// Interfaz para próximas sesiones
interface UpcomingSession {
  id: string;
  studentName: string;
  date: string;
  time: string;
  type: string;
}

// Controlador para obtener estadísticas del dashboard
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    let stats: DashboardStats;

    if (userRole === 'slp') {
      // Estadísticas para SLP
      const totalSessions = await TherapySession.countDocuments({ 
        slpId: userId 
      });
      
      const activeSessions = await TherapySession.countDocuments({ 
        slpId: userId, 
        status: 'active' 
      });
      
      const totalStudents = await User.countDocuments({ 
        role: 'child',
        'child.currentSLP': userId 
      });
      
      const completedSessions = await TherapySession.find({ 
        slpId: userId, 
        status: 'completed' 
      });
      
      // Usar datos básicos por ahora
      const gamesPlayed = completedSessions.length * 2; // Promedio de 2 juegos por sesión
      const averageAccuracy = 85; // Placeholder
      const totalTime = completedSessions.length * 45; // Promedio de 45 min por sesión

      stats = {
        totalSessions,
        activeSessions,
        totalStudents,
        gamesPlayed,
        averageAccuracy,
        totalTime
      };
    } else {
      // Estadísticas para Child
      const totalSessions = await TherapySession.countDocuments({ 
        childId: userId 
      });
      
      const activeSessions = await TherapySession.countDocuments({ 
        childId: userId, 
        status: 'active' 
      });
      
      const totalStudents = 1; // El niño mismo
      
      const completedSessions = await TherapySession.find({ 
        childId: userId, 
        status: 'completed' 
      });
      
      // Usar datos básicos por ahora
      const gamesPlayed = completedSessions.length * 2; // Promedio de 2 juegos por sesión
      const averageAccuracy = 85; // Placeholder
      const totalTime = completedSessions.length * 45; // Promedio de 45 min por sesión

      stats = {
        totalSessions,
        activeSessions,
        totalStudents,
        gamesPlayed,
        averageAccuracy,
        totalTime
      };
    }

    sendSuccessResponse(res, stats, 'Estadísticas del dashboard obtenidas');

  } catch (error) {
    next(error);
  }
};

// Controlador para obtener sesiones recientes
export const getRecentSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    let sessions;

    if (userRole === 'slp') {
      // Sesiones recientes para SLP
      sessions = await TherapySession.find({ slpId: userId })
        .populate('childId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);
    } else {
      // Sesiones recientes para Child
      sessions = await TherapySession.find({ childId: userId })
        .populate('slpId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    const recentSessions: RecentSession[] = sessions.map(session => ({
      id: (session._id as any).toString(),
      studentName: userRole === 'slp' 
        ? `${(session.childId as any).firstName} ${(session.childId as any).lastName}`
        : `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`,
      date: (session as any).createdAt.toISOString().split('T')[0],
      duration: `45 min`, // Placeholder
      accuracy: 85, // Placeholder
      status: session.status as 'completed' | 'active' | 'scheduled'
    }));

    sendSuccessResponse(res, recentSessions, 'Sesiones recientes obtenidas');

  } catch (error) {
    next(error);
  }
};

// Controlador para obtener próximas sesiones
export const getUpcomingSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Usuario no autenticado');
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    let sessions;

    if (userRole === 'slp') {
      // Próximas sesiones para SLP
      sessions = await TherapySession.find({ 
        slpId: userId, 
        status: 'scheduled',
        scheduledDate: { $gte: new Date() }
      })
        .populate('childId', 'firstName lastName')
        .sort({ scheduledDate: 1 })
        .limit(5);
    } else {
      // Próximas sesiones para Child
      sessions = await TherapySession.find({ 
        childId: userId, 
        status: 'scheduled',
        scheduledDate: { $gte: new Date() }
      })
        .populate('slpId', 'firstName lastName')
        .sort({ scheduledDate: 1 })
        .limit(5);
    }

    const upcomingSessions: UpcomingSession[] = sessions.map(session => ({
      id: (session._id as any).toString(),
      studentName: userRole === 'slp' 
        ? `${(session.childId as any).firstName} ${(session.childId as any).lastName}`
        : `${(session.slpId as any).firstName} ${(session.slpId as any).lastName}`,
      date: session.scheduledDate.toISOString().split('T')[0] || '',
      time: session.scheduledDate.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'Terapia del Habla' // Placeholder
    }));

    sendSuccessResponse(res, upcomingSessions, 'Próximas sesiones obtenidas');

  } catch (error) {
    next(error);
  }
};

// Controlador para obtener lista de estudiantes (caseload) para SLP
export const getCaseload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'slp') {
      throw new AuthenticationError('Acceso denegado - Solo para SLP');
    }

    const slpId = req.user._id;

    const students = await User.find({ 
      role: 'child',
      'child.currentSLP': slpId 
    }).select('firstName lastName email child.skillLevel child.sessionsCompleted child.totalSessionTime');

    const caseload = students.map(student => ({
      id: (student._id as any).toString(),
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      skillLevel: student.child?.skillLevel,
      sessionsCompleted: student.child?.sessionsCompleted || 0,
      totalSessionTime: student.child?.totalSessionTime || 0
    }));

    sendSuccessResponse(res, caseload, 'Caseload obtenido');

  } catch (error) {
    next(error);
  }
};
