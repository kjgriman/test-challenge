import { Router } from 'express';
import { authenticate, isSLP } from '../middleware/auth';
import { asyncErrorHandler } from '../middleware/asyncErrorHandler';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentProgress,
  assignStudentToSLP,
  removeStudentFromSLP
} from '../controllers/studentController';

const router = Router();

// Todas las rutas requieren autenticación y rol SLP
router.use(authenticate);
router.use(isSLP);

// CRUD básico
router.get('/', asyncErrorHandler(getStudents));
router.get('/:id', asyncErrorHandler(getStudentById));
router.post('/', asyncErrorHandler(createStudent));
router.put('/:id', asyncErrorHandler(updateStudent));
router.delete('/:id', asyncErrorHandler(deleteStudent));

// Gestión de estudiantes
router.get('/:id/progress', asyncErrorHandler(getStudentProgress));
router.post('/:id/assign', asyncErrorHandler(assignStudentToSLP));
router.post('/:id/remove', asyncErrorHandler(removeStudentFromSLP));

export default router;
