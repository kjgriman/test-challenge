"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var auth_1 = require("../middleware/auth");
var dashboardController_1 = require("../controllers/dashboardController");
var router = express.Router();
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Obtener estadísticas del dashboard
router.get('/stats', dashboardController_1.getDashboardStats);
// Obtener sesiones recientes
router.get('/recent-sessions', dashboardController_1.getRecentSessions);
// Obtener próximas sesiones
router.get('/upcoming-sessions', dashboardController_1.getUpcomingSessions);
// Obtener caseload (solo para SLP)
router.get('/caseload', dashboardController_1.getCaseload);
exports.default = router;
