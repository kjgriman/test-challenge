"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
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
//# sourceMappingURL=dashboard.js.map