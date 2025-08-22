import { Request, Response, NextFunction } from 'express';
import { User, SkillLevel } from '../models/User';
import { TherapySession } from '../models/TherapySession';
import { sendSuccessResponse } from '../utils/responseUtils';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

// Tipos para estudiantes
interface CreateStudentData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  parentEmail: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[];
  notes?: string;
}

interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  parentEmail?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals?: string[];
  notes?: string;
}

// Obtener todos los estudiantes del SLP
export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const slpId = req.user._id;
    const { page = 1, limit = 10, skillLevel, search } = req.query;

    let query: any = {
      role: 'child',
      'child.currentSLP': slpId
    };

    // Filtrar por nivel de habilidad
    if (skillLevel) {
      query['child.skillLevel'] = skillLevel;
    }

    // Búsqueda por nombre o email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const students = await User.find(query)
      .select('firstName lastName email child.skillLevel child.sessionsCompleted child.totalSessionTime child.primaryGoals')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    sendSuccessResponse(res, {
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Estudiantes obtenidos exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener estudiante por ID
export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['id'];
    const slpId = req.user._id;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Verificar que el estudiante pertenece al SLP
    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para ver este estudiante');
    }

    sendSuccessResponse(res, student, 'Estudiante obtenido exitosamente');

  } catch (error) {
    next(error);
  }
};

// Crear nuevo estudiante
export const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const slpId = req.user._id;
    const studentData: CreateStudentData = req.body;

    // Verificar que el email no esté en uso
    const existingUser = await User.findOne({ email: studentData.email });
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Crear el estudiante
    const student = new User({
      email: studentData.email,
      password: studentData.password, // Se hasheará automáticamente
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      role: 'child',
      child: {
        parentEmail: studentData.parentEmail,
        skillLevel: studentData.skillLevel as SkillLevel,
        primaryGoals: studentData.primaryGoals,
        sessionsCompleted: 0,
        totalSessionTime: 0,
        currentSLP: slpId,
        notes: studentData.notes
      }
    });

    await student.save();

    // Actualizar el contador de estudiantes del SLP
    await User.findByIdAndUpdate(slpId, {
      $inc: { 'slp.caseloadCount': 1 }
    });

    sendSuccessResponse(res, student, 'Estudiante creado exitosamente', 201);

  } catch (error) {
    next(error);
  }
};

// Actualizar estudiante
export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['id'];
    const slpId = req.user._id;
    const updateData: UpdateStudentData = req.body;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Verificar que el estudiante pertenece al SLP
    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para modificar este estudiante');
    }

    // Actualizar campos básicos
    if (updateData.firstName) student.firstName = updateData.firstName;
    if (updateData.lastName) student.lastName = updateData.lastName;

    // Actualizar campos del child
    if (updateData.parentEmail) student.child!.parentEmail = updateData.parentEmail;
    if (updateData.skillLevel) student.child!.skillLevel = updateData.skillLevel as SkillLevel;
    if (updateData.primaryGoals) student.child!.primaryGoals = updateData.primaryGoals;
    if (updateData.notes) (student.child as any).notes = updateData.notes;

    await student.save();

    sendSuccessResponse(res, student, 'Estudiante actualizado exitosamente');

  } catch (error) {
    next(error);
  }
};

// Eliminar estudiante
export const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['id'];
    const slpId = req.user._id;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Verificar que el estudiante pertenece al SLP
    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para eliminar este estudiante');
    }

    // Verificar que no tenga sesiones activas
    const activeSessions = await TherapySession.countDocuments({
      childId: studentId,
      status: { $in: ['scheduled', 'in_progress'] }
    });

    if (activeSessions > 0) {
      throw new ValidationError('No se puede eliminar un estudiante con sesiones activas');
    }

    // Eliminar el estudiante
    await User.findByIdAndDelete(studentId);

    // Actualizar el contador de estudiantes del SLP
    await User.findByIdAndUpdate(slpId, {
      $inc: { 'slp.caseloadCount': -1 }
    });

    sendSuccessResponse(res, null, 'Estudiante eliminado exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener progreso del estudiante
export const getStudentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['id'];
    const slpId = req.user._id;
    const { period = '30' } = req.query; // días

    const student = await User.findById(studentId);

    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Verificar que el estudiante pertenece al SLP
    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para ver este estudiante');
    }

    // Calcular fecha límite
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period));

    // Obtener sesiones completadas en el período
    const sessions = await TherapySession.find({
      childId: studentId,
      status: 'completed',
      endTime: { $gte: startDate }
    }).sort({ endTime: -1 });

    // Calcular estadísticas
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const averageAccuracy = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / sessions.length 
      : 0;
    const totalGames = sessions.reduce((sum, session) => sum + (session.gamesPlayed || 0), 0);

    // Progreso por objetivo
    const goalsProgress = student.child?.primaryGoals?.map(goal => ({
      goal,
      sessionsCount: sessions.filter(s => s.goals?.includes(goal)).length,
      averageAccuracy: sessions.filter(s => s.goals?.includes(goal))
        .reduce((sum, s) => sum + (s.accuracy || 0), 0) / 
        Math.max(sessions.filter(s => s.goals?.includes(goal)).length, 1)
    })) || [];

    const progress = {
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        skillLevel: student.child?.skillLevel,
        primaryGoals: student.child?.primaryGoals
      },
      period: Number(period),
      stats: {
        totalSessions,
        totalTime,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        totalGames
      },
      goalsProgress,
      recentSessions: sessions.slice(0, 5) // Últimas 5 sesiones
    };

    sendSuccessResponse(res, progress, 'Progreso del estudiante obtenido exitosamente');

  } catch (error) {
    next(error);
  }
};

// Asignar estudiante a SLP
export const assignStudentToSLP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['id'];
    const slpId = req.user._id;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Verificar que el estudiante no esté ya asignado a este SLP
    if (student.child?.currentSLP?.toString() === slpId.toString()) {
      throw new ConflictError('El estudiante ya está asignado a este SLP');
    }

    // Actualizar asignación
    student.child!.currentSLP = slpId;
    await student.save();

    // Actualizar contadores de SLP
    if (student.child?.currentSLP) {
      // Decrementar contador del SLP anterior
      await User.findByIdAndUpdate(student.child.currentSLP, {
        $inc: { 'slp.caseloadCount': -1 }
      });
    }

    // Incrementar contador del nuevo SLP
    await User.findByIdAndUpdate(slpId, {
      $inc: { 'slp.caseloadCount': 1 }
    });

    sendSuccessResponse(res, student, 'Estudiante asignado exitosamente');

  } catch (error) {
    next(error);
  }
};

// Remover estudiante del SLP
export const removeStudentFromSLP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['id'];
    const slpId = req.user._id;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    // Verificar que el estudiante esté asignado a este SLP
    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('El estudiante no está asignado a este SLP');
    }

    // Verificar que no tenga sesiones activas
    const activeSessions = await TherapySession.countDocuments({
      childId: studentId,
      status: { $in: ['scheduled', 'in_progress'] }
    });

    if (activeSessions > 0) {
      throw new ValidationError('No se puede remover un estudiante con sesiones activas');
    }

    // Remover asignación
    student.child!.currentSLP = null as any;
    await student.save();

    // Decrementar contador del SLP
    await User.findByIdAndUpdate(slpId, {
      $inc: { 'slp.caseloadCount': -1 }
    });

    sendSuccessResponse(res, student, 'Estudiante removido exitosamente');

  } catch (error) {
    next(error);
  }
};
