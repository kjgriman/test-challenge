const express = require('express');
import { authenticate } from '../middleware/auth';
import {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  startEvaluation,
  completeEvaluation,
  addEvaluationResult,
  deleteEvaluation,
  getStudentEvaluations,
  validateCreateEvaluation,
  validateUpdateEvaluation,
  validateAddResult
} from '../controllers/evaluationController';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticate);

// Rutas principales de evaluaciones
router.get('/', getEvaluations);
router.get('/:id', getEvaluationById);
router.post('/', validateCreateEvaluation, createEvaluation);
router.put('/:id', validateUpdateEvaluation, updateEvaluation);
router.delete('/:id', deleteEvaluation);

// Rutas de gestión de evaluación
router.post('/:id/start', startEvaluation);
router.post('/:id/complete', completeEvaluation);
router.post('/:id/results', validateAddResult, addEvaluationResult);

// Rutas específicas por estudiante
router.get('/student/:studentId', getStudentEvaluations);

export default router;
