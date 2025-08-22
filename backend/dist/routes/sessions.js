"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncErrorHandler_1 = require("../middleware/asyncErrorHandler");
const sessionController_1 = require("../controllers/sessionController");
const router = (0, express_1.Router)();
// Rutas para sesiones (requieren autenticación)
router.use(auth_1.authenticate);
// CRUD básico
router.post('/', auth_1.isSLP, (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.createSession));
router.get('/', (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.getSessions));
router.get('/:id', (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.getSessionById));
router.put('/:id', auth_1.isSLP, (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.updateSession));
router.delete('/:id', auth_1.isSLP, (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.deleteSession));
// Gestión de sesiones
router.post('/:id/join', (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.joinSession));
router.post('/:id/leave', (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.leaveSession));
router.post('/:id/start', auth_1.isSLP, (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.startSession));
router.post('/:id/end', auth_1.isSLP, (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.endSession));
router.get('/:id/participants', (0, asyncErrorHandler_1.asyncErrorHandler)(sessionController_1.getSessionParticipants));
exports.default = router;
//# sourceMappingURL=sessions.js.map