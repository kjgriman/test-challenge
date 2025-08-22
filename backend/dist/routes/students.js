"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncErrorHandler_1 = require("../middleware/asyncErrorHandler");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación y rol SLP
router.use(auth_1.authenticate);
router.use(auth_1.isSLP);
// CRUD básico
router.get('/', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.getStudents));
router.get('/:id', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.getStudentById));
router.post('/', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.createStudent));
router.put('/:id', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.updateStudent));
router.delete('/:id', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.deleteStudent));
// Gestión de estudiantes
router.get('/:id/progress', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.getStudentProgress));
router.post('/:id/assign', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.assignStudentToSLP));
router.post('/:id/remove', (0, asyncErrorHandler_1.asyncErrorHandler)(studentController_1.removeStudentFromSLP));
exports.default = router;
//# sourceMappingURL=students.js.map