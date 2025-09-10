import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Evaluation, EvaluationType, EvaluationStatus, AssessmentArea, IEvaluationResult } from '../models/Evaluation';
import { User } from '../models/User';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseUtils';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';

// Interfaces para tipos de datos
interface CreateEvaluationData {
  studentId: string;
  evaluationType: EvaluationType;
  title: string;
  description?: string;
  scheduledDate: Date;
  assessmentAreas: AssessmentArea[];
  toolsUsed?: string[];
  environment?: string;
}

interface UpdateEvaluationData {
  title?: string;
  description?: string;
  scheduledDate?: Date;
  assessmentAreas?: AssessmentArea[];
  toolsUsed?: string[];
  environment?: string;
  slpNotes?: string;
  behavioralObservations?: string[];
  parentFeedback?: string;
}

interface AddResultData {
  area: AssessmentArea;
  subArea?: string;
  score: number;
  maxScore: number;
  observations?: string;
  recommendations?: string[];
}

// Obtener todas las evaluaciones del SLP
export const getEvaluations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const slpId = req.user._id;
    const { page = 1, limit = 10, studentId, status, evaluationType } = req.query;

    // Construir query
    let query: any = { slpId };

    if (studentId) {
      query.studentId = studentId;
    }

    if (status) {
      query.status = status;
    }

    if (evaluationType) {
      query.evaluationType = evaluationType;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const evaluations = await Evaluation.find(query)
      .populate('studentId', 'firstName lastName email child.skillLevel')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Evaluation.countDocuments(query);

    sendSuccessResponse(res, {
      evaluations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'Evaluaciones obtenidas exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener evaluación por ID
export const getEvaluationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const evaluationId = req.params['id'];
    const slpId = req.user._id;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, slpId })
      .populate('studentId', 'firstName lastName email child.skillLevel child.primaryGoals');

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    sendSuccessResponse(res, evaluation, 'Evaluación obtenida exitosamente');

  } catch (error) {
    next(error);
  }
};

// Crear nueva evaluación
export const createEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const slpId = req.user._id;
    const evaluationData: CreateEvaluationData = req.body;

    // Verificar que el estudiante existe y pertenece al SLP
    const student = await User.findById(evaluationData.studentId);
    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para evaluar este estudiante');
    }

    // Crear la evaluación
    const evaluation = new Evaluation({
      slpId,
      studentId: evaluationData.studentId,
      evaluationType: evaluationData.evaluationType,
      title: evaluationData.title,
      description: evaluationData.description,
      scheduledDate: evaluationData.scheduledDate,
      assessmentAreas: evaluationData.assessmentAreas,
      toolsUsed: evaluationData.toolsUsed || [],
      environment: evaluationData.environment || 'clinic',
      status: EvaluationStatus.SCHEDULED,
      results: [],
      overallScore: 0,
      averageScore: 0,
      strengths: [],
      weaknesses: [],
      recommendations: [],
      treatmentPlan: {
        goals: [],
        strategies: [],
        frequency: '',
        duration: ''
      },
      slpNotes: '',
      behavioralObservations: [],
      parentFeedback: ''
    });

    await evaluation.save();

    // Poblar datos del estudiante para la respuesta
    await evaluation.populate('studentId', 'firstName lastName email child.skillLevel');

    sendSuccessResponse(res, evaluation, 'Evaluación creada exitosamente', 201);

  } catch (error) {
    next(error);
  }
};

// Actualizar evaluación
export const updateEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const evaluationId = req.params['id'];
    const slpId = req.user._id;
    const updateData: UpdateEvaluationData = req.body;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, slpId });

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    // Solo permitir actualización si no está completada
    if (evaluation.status === EvaluationStatus.COMPLETED) {
      throw new ValidationError('No se puede modificar una evaluación completada');
    }

    // Actualizar campos
    Object.assign(evaluation, updateData);
    await evaluation.save();

    // Poblar datos del estudiante para la respuesta
    await evaluation.populate('studentId', 'firstName lastName email child.skillLevel');

    sendSuccessResponse(res, evaluation, 'Evaluación actualizada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Iniciar evaluación
export const startEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const evaluationId = req.params['id'];
    const slpId = req.user._id;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, slpId });

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    if (evaluation.status !== EvaluationStatus.SCHEDULED) {
      throw new ValidationError('Solo se pueden iniciar evaluaciones programadas');
    }

    evaluation.status = EvaluationStatus.IN_PROGRESS;
    evaluation.startTime = new Date();
    await evaluation.save();

    sendSuccessResponse(res, evaluation, 'Evaluación iniciada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Finalizar evaluación
export const completeEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const evaluationId = req.params['id'];
    const slpId = req.user._id;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, slpId });

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    if (evaluation.status !== EvaluationStatus.IN_PROGRESS) {
      throw new ValidationError('Solo se pueden finalizar evaluaciones en progreso');
    }

    evaluation.status = EvaluationStatus.COMPLETED;
    evaluation.endTime = new Date();
    evaluation.calculateOverallScore();
    await evaluation.save();

    sendSuccessResponse(res, evaluation, 'Evaluación completada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Agregar resultado de evaluación
export const addEvaluationResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const evaluationId = req.params['id'];
    const slpId = req.user._id;
    const resultData: AddResultData = req.body;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, slpId });

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    if (evaluation.status !== EvaluationStatus.IN_PROGRESS) {
      throw new ValidationError('Solo se pueden agregar resultados a evaluaciones en progreso');
    }

    // Verificar que el área esté en las áreas de evaluación
    if (!evaluation.assessmentAreas.includes(resultData.area)) {
      throw new ValidationError('El área no está incluida en esta evaluación');
    }

    // Calcular porcentaje
    const percentage = Math.round((resultData.score / resultData.maxScore) * 100);

    const result: IEvaluationResult = {
      area: resultData.area,
      subArea: resultData.subArea,
      score: resultData.score,
      maxScore: resultData.maxScore,
      percentage,
      observations: resultData.observations || '',
      recommendations: resultData.recommendations || []
    };

    evaluation.addResult(result);
    await evaluation.save();

    sendSuccessResponse(res, evaluation, 'Resultado agregado exitosamente');

  } catch (error) {
    next(error);
  }
};

// Eliminar evaluación
export const deleteEvaluation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const evaluationId = req.params['id'];
    const slpId = req.user._id;

    const evaluation = await Evaluation.findOne({ _id: evaluationId, slpId });

    if (!evaluation) {
      throw new NotFoundError('Evaluación no encontrada');
    }

    // Solo permitir eliminación si no está completada
    if (evaluation.status === EvaluationStatus.COMPLETED) {
      throw new ValidationError('No se puede eliminar una evaluación completada');
    }

    await Evaluation.findByIdAndDelete(evaluationId);

    sendSuccessResponse(res, null, 'Evaluación eliminada exitosamente');

  } catch (error) {
    next(error);
  }
};

// Obtener evaluaciones de un estudiante específico
export const getStudentEvaluations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Usuario no autenticado');
    }

    const studentId = req.params['studentId'];
    const slpId = req.user._id;

    // Verificar que el estudiante pertenece al SLP
    const student = await User.findById(studentId);
    if (!student || student.role !== 'child') {
      throw new NotFoundError('Estudiante no encontrado');
    }

    if (student.child?.currentSLP?.toString() !== slpId.toString()) {
      throw new ValidationError('No tienes permisos para ver las evaluaciones de este estudiante');
    }

    const evaluations = await Evaluation.find({ studentId, slpId })
      .sort({ scheduledDate: -1 });

    sendSuccessResponse(res, { evaluations }, 'Evaluaciones del estudiante obtenidas exitosamente');

  } catch (error) {
    next(error);
  }
};

// Validaciones para las rutas
export const validateCreateEvaluation = [
  body('studentId').isMongoId().withMessage('ID de estudiante inválido'),
  body('evaluationType').isIn(Object.values(EvaluationType)).withMessage('Tipo de evaluación inválido'),
  body('title').isLength({ min: 1, max: 100 }).withMessage('El título debe tener entre 1 y 100 caracteres'),
  body('description').optional().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('scheduledDate').isISO8601().withMessage('Fecha programada inválida'),
  body('assessmentAreas').isArray({ min: 1 }).withMessage('Debe seleccionar al menos un área de evaluación'),
  body('assessmentAreas.*').isIn(Object.values(AssessmentArea)).withMessage('Área de evaluación inválida'),
  body('toolsUsed').optional().isArray().withMessage('Herramientas debe ser un array'),
  body('environment').optional().isIn(['clinic', 'home', 'school', 'virtual', 'other']).withMessage('Ambiente inválido')
];

export const validateUpdateEvaluation = [
  body('title').optional().isLength({ min: 1, max: 100 }).withMessage('El título debe tener entre 1 y 100 caracteres'),
  body('description').optional().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('scheduledDate').optional().isISO8601().withMessage('Fecha programada inválida'),
  body('assessmentAreas').optional().isArray({ min: 1 }).withMessage('Debe seleccionar al menos un área de evaluación'),
  body('assessmentAreas.*').optional().isIn(Object.values(AssessmentArea)).withMessage('Área de evaluación inválida'),
  body('toolsUsed').optional().isArray().withMessage('Herramientas debe ser un array'),
  body('environment').optional().isIn(['clinic', 'home', 'school', 'virtual', 'other']).withMessage('Ambiente inválido'),
  body('slpNotes').optional().isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres'),
  body('behavioralObservations').optional().isArray().withMessage('Observaciones conductuales debe ser un array'),
  body('parentFeedback').optional().isLength({ max: 500 }).withMessage('El feedback de los padres no puede exceder 500 caracteres')
];

export const validateAddResult = [
  body('area').isIn(Object.values(AssessmentArea)).withMessage('Área de evaluación inválida'),
  body('subArea').optional().isLength({ max: 50 }).withMessage('El subárea no puede exceder 50 caracteres'),
  body('score').isNumeric().isFloat({ min: 0, max: 100 }).withMessage('El puntaje debe ser entre 0 y 100'),
  body('maxScore').isNumeric().isFloat({ min: 1 }).withMessage('El puntaje máximo debe ser al menos 1'),
  body('observations').optional().isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder 500 caracteres'),
  body('recommendations').optional().isArray().withMessage('Recomendaciones debe ser un array')
];
