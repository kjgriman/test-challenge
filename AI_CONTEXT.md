# 🤖 CONTEXTO PARA AI - PLATAFORMA DE TERAPIA DEL HABLA

## 🎯 **INSTRUCCIONES PARA EL AI**
Este documento debe ser leído COMPLETAMENTE antes de responder cualquier pregunta del usuario. Contiene todo el contexto necesario del proyecto para evitar preguntas redundantes.

## 🎯 **CHALLENGE COMPLETO - PLATAFORMA MINI DE TERAPIA DEL HABLA VIRTUAL**

### **Objetivo Principal**
Construir una plataforma mini de terapia del habla virtual que permita a terapeutas del habla (SLP) realizar sesiones virtuales con niños.

### **Funcionalidades Requeridas**

#### **1. Sesión de Videollamada Simple**
- Videollamada entre terapeuta y niño
- Puede usar biblioteca/servicio de terceros con plan gratuito

#### **2. Juego Interactivo Básico con Phaser**
- Juego basado en comunicación, lenguaje o habla
- Sincronización con WebSocket
- Ambos (niño y SLP) pueden jugar por turnos

#### **3. Registro de Datos de Sesión**
- SLP registra intentos correctos/incorrectos
- Muestra porcentaje de aciertos
- Notas subjetivas/comportamentales

#### **4. Perfil de Estudiante**
- Visualización de progreso simple
- Resumen de las últimas 3 sesiones

#### **5. Vista de Casos (Caseload)**
- Lista de estudiantes bajo el SLP
- Métricas generales de cada estudiante

#### **6. Funcionalidades para Implementar (Scaffold)**
- Resumen de sesión generado por IA al final (usando cualquier API de LLM)
- Resumen de las últimas 3 sesiones en el perfil del estudiante

#### **7. Despliegue**
- Desplegar en plataforma accesible para demo

### **Pautas del Challenge**
- Mantener cada función simple/básica
- Enfocarse en funcionalidad core sobre pulido
- No se espera perfección - queremos ver el proceso de pensamiento
- Usar herramientas de IA extensivamente, pero revisar todo el código generado
- Documentar tradeoffs, refinamientos no fundamentales omitidos y suposiciones no obvias en comentarios
- Construir una base técnica sólida

### **Requisitos Técnicos**
- **Backend**: Node, TypeScript
- **Frontend**: React, TypeScript (shadcn-ui y tailwindcss preferidos pero no requeridos)
- **Base de datos**: NoSQL preferido, pero Relacional/PostgreSQL funciona
- **Tiempo real**: WebSockets para sincronización del juego
- **Despliegue**: Desplegar en plataforma cloud (Heroku, Vercel, Railway, etc.)

### **Entregables**
- Aplicación funcionando (desplegada y accesible)
- Código fuente (repositorio GitHub)
- Documentación (README con configuración, notas de arquitectura, trade-offs)
- Video demo (5-10 minutos mostrando características clave)

### **Notas Importantes**
- No trabajar más de 7 días en el proyecto
- Priorizar características fundamentales sobre completitud
- Documentar tiempo dedicado
- Enfocarse en enfoque de resolución de problemas y estilo de código
- ¡Disfrutar el challenge y aspectos creativos!

## 📋 **RESUMEN EJECUTIVO**
- **Proyecto**: Plataforma virtual de terapia del habla (CHALLENGE DE DESARROLLADOR FULL STACK)
- **Estado**: ✅ Autenticación completa, ✅ Dashboard funcional, ✅ CRUD de sesiones y estudiantes, ✅ MongoDB Atlas configurado
- **Próximo objetivo**: Videollamadas WebRTC, juegos interactivos con Phaser, WebSockets
- **Usuario**: Prefiere MongoDB Atlas, shadcn/ui, respuestas en español
- **Tiempo límite**: 7 días máximo (DÍA 2 COMPLETADO)

## 🏗️ **ARQUITECTURA TÉCNICA**

### **Frontend Stack**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (ya configurado)
- Zustand para state management
- React Router DOM
- Framer Motion para animaciones
- Lucide React para iconos

### **Backend Stack**
- Node.js + Express + TypeScript
- MongoDB local + Mongoose
- JWT + bcrypt para autenticación
- Socket.io para tiempo real
- express-validator

## 🚀 **AVANCES DEL DÍA 2 - COMPLETADO**

## 🚀 **AVANCES DEL DÍA 3 - VIDEOCONFERENCIAS PARCIALMENTE COMPLETADAS**

### **✅ Funcionalidades Implementadas**

#### **1. Sistema de Videoconferencias** ✅ **PARCIALMENTE COMPLETADO**
- ✅ **Modelo VideoRoom** - Esquema MongoDB para salas de videoconferencia
- ✅ **API de salas** - CRUD completo para crear, unirse, cerrar salas
- ✅ **VideoRoomManager** - Componente frontend para gestionar salas
- ✅ **ConnectedVideoCall** - Componente de videollamada con WebRTC simulado
- ✅ **useVideoRoom hook** - Hook para manejo de estado de sala y Socket.io
- ✅ **Socket.io handlers** - Handlers para join/leave/update participantes
- ✅ **Sistema de invitaciones** - Códigos de invitación y modales
- ✅ **Página JoinRoom** - Página para unirse a salas por código
- ✅ **Autenticación Socket.io** - Token JWT para autenticación WebSocket
- ✅ **Rate limiting** - Configuración permisiva para desarrollo
- [ ] **Conexión WebRTC real** - Implementar conexión P2P real (actualmente simulado)
- [ ] **Múltiples participantes** - Soporte para más de 2 usuarios

#### **2. Base de Datos y Autenticación**
- ✅ **MongoDB Atlas configurado** - Migración de MongoDB local a Atlas
- ✅ **Usuarios de prueba creados** - test@test.com (SLP), child@test.com (Child)
- ✅ **Rate limiting configurado** - Prevención de abuso con límites permisivos en desarrollo
- ✅ **Autenticación JWT funcional** - Login/logout con persistencia
- ✅ **Middleware de autenticación** - Protección de rutas por rol

#### **2. Dashboard Funcional**
- ✅ **Dashboard principal** - Estadísticas en tiempo real desde API
- ✅ **Estadísticas dinámicas** - Total sesiones, activas, estudiantes, precisión
- ✅ **Sesiones recientes** - Lista de últimas sesiones con estado
- ✅ **Próximas sesiones** - Sesiones programadas próximas
- ✅ **Acciones rápidas** - Botones para funcionalidades principales

#### **3. CRUD Completo de Sesiones**
- ✅ **API de sesiones** - GET, POST, PUT, DELETE con autenticación
- ✅ **Página de gestión de sesiones** - Lista con filtros y búsqueda
- ✅ **Modal crear sesión** - Formulario completo con validaciones
- ✅ **Modal editar sesión** - Edición de sesiones existentes
- ✅ **Acciones de sesión** - Iniciar, finalizar, eliminar sesiones

#### **4. CRUD Completo de Estudiantes**
- ✅ **API de estudiantes** - GET, POST, PUT, DELETE
- ✅ **Página de gestión de estudiantes** - Lista con filtros
- ✅ **Modal crear estudiante** - Registro de nuevos estudiantes
- ✅ **Modal editar estudiante** - Edición de datos
- ✅ **Modal progreso estudiante** - Visualización de progreso

#### **5. Backend Robusto**
- ✅ **Rutas protegidas** - Middleware de autenticación y autorización
- ✅ **Manejo de errores** - Clases de error personalizadas
- ✅ **Validaciones** - express-validator en todas las rutas
- ✅ **Rate limiting** - Protección contra abuso
- ✅ **WebSockets configurados** - Socket.io listo para tiempo real

#### **6. Frontend Avanzado**
- ✅ **State management** - Zustand con persistencia
- ✅ **Routing protegido** - Rutas basadas en rol de usuario
- ✅ **UI/UX moderna** - shadcn/ui + Tailwind + Framer Motion
- ✅ **Responsive design** - Funciona en móvil y desktop
- ✅ **Loading states** - Indicadores de carga en todas las operaciones

### **🔧 Configuración Técnica**
- ✅ **MongoDB Atlas** - Base de datos en la nube
- ✅ **Scripts de población** - Datos de prueba automáticos
- ✅ **Variables de entorno** - Configuración segura
- ✅ **CORS configurado** - Frontend-backend comunicación
- ✅ **Helmet security** - Headers de seguridad

### **🐛 Problemas Resueltos**
- ✅ **Puerto 3001 ocupado** - Solucionado con taskkill
- ✅ **TypeScript strict mode** - Errores de compilación resueltos
- ✅ **Importaciones circulares** - Refactorización de imports
- ✅ **Caché del navegador** - Hot reload funcionando
- ✅ **Autenticación persistente** - Tokens JWT con refresh
- ✅ **Rate limiting estricto** - Configuración permisiva para desarrollo
- ✅ **apiRequest no definido** - Función agregada al store de autenticación
- ✅ **Sidebar no visible** - Configuración de estado abierto por defecto
- ✅ **Navegación a videoconferencias** - Enlaces agregados al sidebar
- ✅ **Socket.io autenticación** - Token JWT agregado a conexión WebSocket
- ✅ **Error de validación VideoRoom** - Método addParticipant corregido

## 📋 **TODO LIST - DÍA 3**

### **🎯 Prioridad ALTA (Core Features)**

#### **1. Videollamadas WebRTC** ✅ **PARCIALMENTE COMPLETADO**
- ✅ **Configurar WebRTC** - Implementar videollamada básica
- ✅ **Room management** - Crear/unión a salas de videollamada
- ✅ **UI de videollamada** - Interfaz para cámara y micrófono
- ✅ **Controles básicos** - Mute/unmute, encender/apagar cámara
- ✅ **Integración con sesiones** - Conectar videollamada a sesiones existentes
- ✅ **Socket.io para signaling** - Conexión WebSocket para videollamadas
- ✅ **Sistema de invitaciones** - Códigos de invitación para unirse a salas
- ✅ **Gestión de participantes** - Lista de participantes en tiempo real
- [ ] **Conexión WebRTC real** - Implementar conexión P2P real (actualmente simulado)
- [ ] **Múltiples participantes** - Soporte para más de 2 usuarios

#### **2. Juegos Interactivos con Phaser**
- [ ] **Setup Phaser** - Configurar Phaser.js en el proyecto
- [ ] **Juego básico de comunicación** - Juego simple de palabras/imágenes
- [ ] **Sincronización WebSocket** - Estado del juego en tiempo real
- [ ] **Turnos** - Sistema de turnos entre SLP y niño
- [ ] **Puntuación** - Sistema de puntos y aciertos

#### **3. WebSockets para Tiempo Real** ✅ **PARCIALMENTE COMPLETADO**
- ✅ **Socket.io handlers** - Implementar handlers para videollamadas
- ✅ **Room management** - Gestión de salas de videollamada
- ✅ **Eventos de videollamada** - Eventos para signaling
- ✅ **Estado compartido** - Estado de participantes compartido
- ✅ **Reconexión** - Manejo de desconexiones
- [ ] **Handlers para juegos** - Implementar handlers específicos para juegos
- [ ] **Sincronización de juegos** - Estado del juego en tiempo real

### **🎯 Prioridad MEDIA (UX/UI)**

#### **4. Mejoras de UX**
- [ ] **Notificaciones** - Toast notifications para acciones
- [ ] **Confirmaciones** - Diálogos de confirmación para acciones críticas
- [ ] **Loading states** - Mejorar indicadores de carga
- [ ] **Error handling** - Manejo de errores más amigable
- [ ] **Responsive design** - Mejorar diseño móvil

#### **5. Funcionalidades de Sesión**
- [ ] **Timer de sesión** - Cronómetro para sesiones
- [ ] **Notas en tiempo real** - Editor de notas durante sesión
- [ ] **Grabación de métricas** - Registrar aciertos/errores
- [ ] **Resumen automático** - Generar resumen al finalizar
- [ ] **Exportar datos** - Exportar reportes de sesión

### **🎯 Prioridad BAJA (Scaffold)**

#### **6. Integración IA (Scaffold)**
- [ ] **API de LLM** - Integrar API para resúmenes
- [ ] **Resumen automático** - Generar resumen con IA
- [ ] **Sugerencias** - Sugerencias de ejercicios
- [ ] **Análisis de progreso** - Análisis automático de progreso

#### **7. Despliegue**
- [ ] **Preparar para producción** - Optimizaciones finales
- [ ] **Variables de entorno** - Configurar para producción
- [ ] **Build scripts** - Scripts de construcción
- [ ] **Documentación** - README y documentación
- [ ] **Demo video** - Grabar demo de funcionalidades

### **🔧 Tareas Técnicas**

#### **8. Optimizaciones**
- [ ] **Performance** - Optimizar carga de datos
- [ ] **Caching** - Implementar cache para datos estáticos
- [ ] **Bundle size** - Reducir tamaño del bundle
- [ ] **Lazy loading** - Carga diferida de componentes
- [ ] **Code splitting** - División de código por rutas

#### **9. Testing**
- [ ] **Unit tests** - Tests básicos para componentes críticos
- [ ] **Integration tests** - Tests de API
- [ ] **E2E tests** - Tests de flujos completos
- [ ] **Error scenarios** - Tests de casos de error

### **📊 Métricas de Progreso**
- **Día 1**: ✅ Autenticación y estructura base
- **Día 2**: ✅ Dashboard y CRUD completo
- **Día 3**: 🎯 Videollamadas y juegos (OBJETIVO PRINCIPAL)
- **Día 4**: 🎯 WebSockets y sincronización
- **Día 5**: 🎯 Mejoras UX y optimizaciones
- **Día 6**: 🎯 Testing y preparación para producción
- **Día 7**: 🎯 Despliegue y documentación

### **⚠️ Notas Importantes**
- **Enfoque**: Priorizar videollamadas y juegos sobre perfección
- **WebRTC**: Usar biblioteca simple como PeerJS o similar
- **Phaser**: Mantener juegos simples, enfocarse en sincronización
- **Tiempo**: Máximo 2 horas por feature principal
- **Documentación**: Comentar trade-offs y decisiones técnicas

## 🔧 **CONFIGURACIÓN CRÍTICA**
```bash
# Backend (OBLIGATORIO)
MONGODB_URI=mongodb+srv://speech-therapy-user:speech-therapy-2024@cluster0.xxxxx.mongodb.net/speech-therapy?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Frontend (usado para proxy)
VITE_API_URL= (vacío para usar proxy)
```

### **Puertos**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- MongoDB: mongodb://127.0.0.1:27017

### **Comandos de Inicio**
```bash
# Opción 1: Todo junto (puede fallar en Windows)
npm run dev

# Opción 2: Separado (RECOMENDADO)
# Terminal 1 - Backend:
cd backend && MONGODB_URI="mongodb://127.0.0.1:27017/speech-therapy" npm run dev

# Terminal 2 - Frontend:
cd frontend && npm run dev
```

## ✅ **FUNCIONALIDADES COMPLETADAS**

### **1. Autenticación Completa**
- ✅ Registro SLP con campos: email, password, firstName, lastName, licenseNumber, specialization[], yearsOfExperience
- ✅ Registro de niños con campos: email, password, firstName, lastName, parentEmail, age
- ✅ Login funcional
- ✅ JWT token management
- ✅ Password hashing

### **2. Formularios UI**
- ✅ Landing page con shadcn/ui (moderna, responsive)
- ✅ Login/Register form dual con validaciones
- ✅ Campos específicos por rol (SLP vs Child)
- ✅ Especializaciones como checkboxes con valores correctos del enum

### **3. Base de Datos**
- ✅ MongoDB local configurado
- ✅ Esquemas: User, TherapySession, Game
- ✅ Usuarios de prueba registrados
- ✅ Scripts de exploración disponibles

### **4. Comunicación Frontend-Backend**
- ✅ Vite proxy configurado (/api → http://localhost:3001)
- ✅ CSP errors resueltos
- ✅ API_BASE_URL usando proxy en desarrollo

## 🎨 **COMPONENTES UI DISPONIBLES**

### **shadcn/ui Instalados**
- Button (con variantes)
- Card (con header, content, description)
- Badge

### **Páginas Implementadas**
- Landing.tsx (moderna con shadcn/ui)
- Login.tsx (formulario dual completo)
- Dashboard.tsx (básico, necesita desarrollo)

## 📊 **ESTADO DE LA BASE DE DATOS**

### **Usuarios Registrados**
- test@test.com (SLP) - Licencia: 123456789
- kjgriman@gmail.com (SLP) - Licencia: 123456780

### **Esquemas Definidos**
```typescript
// User Schema
{
  email: String (único),
  password: String (hasheado),
  role: 'slp' | 'child',
  firstName: String,
  lastName: String,
  slp: {
    licenseNumber: String (único),
    specialization: ['articulation', 'language', 'fluency', 'voice', 'swallowing', 'cognitive'],
    yearsOfExperience: Number
  },
  child: {
    parentEmail: String,
    skillLevel: 'beginner' | 'intermediate' | 'advanced',
    age: Number
  }
}
```

## 🐛 **PROBLEMAS RESUELTOS**

### **Errores Críticos Solucionados**
1. **CSP Errors**: Resuelto usando proxy de Vite
2. **MongoDB IPv6/IPv4**: Resuelto usando 127.0.0.1
3. **shadcn/ui Setup**: Configurado completamente
4. **Formulario SLP**: Campos specialization y yearsOfExperience agregados
5. **Enum Validation**: Valores de especialización alineados con backend

### **Problemas Menores Pendientes**
- Fast Refresh warnings en Vite (no crítico)
- Windows environment variables en npm scripts
- Algunas rutas comentadas en backend

## 📁 **ARCHIVOS CRÍTICOS**

### **🆕 Archivos Nuevos (Día 3)**
- `backend/src/models/VideoRoom.ts` - Modelo para salas de videoconferencia
- `backend/src/controllers/videoRoomController.ts` - Controlador para gestión de salas
- `backend/src/routes/videoRooms.ts` - Rutas API para salas
- `backend/src/sockets/videoRoomHandlers.ts` - Handlers Socket.io para videollamadas
- `frontend/src/components/video/VideoRoomManager.tsx` - Gestor de salas frontend
- `frontend/src/components/video/ConnectedVideoCall.tsx` - Componente de videollamada
- `frontend/src/components/video/InviteCodeModal.tsx` - Modal de código de invitación
- `frontend/src/components/video/JoinRoomModal.tsx` - Modal para unirse a salas
- `frontend/src/pages/VideoRooms.tsx` - Página principal de videoconferencias
- `frontend/src/pages/JoinRoom.tsx` - Página para unirse por código
- `frontend/src/hooks/useVideoRoom.ts` - Hook para manejo de salas y Socket.io

### **📝 Archivos Modificados (Día 3)**
- `backend/src/index.ts` - Agregadas rutas de video rooms y rate limiting condicional
- `backend/src/middleware/rateLimiter.ts` - Límites permisivos para desarrollo
- `backend/src/sockets/socketHandlers.ts` - Integración de video room handlers
- `frontend/src/store/authStore.ts` - Función apiRequest agregada al store
- `frontend/src/components/layout/Sidebar.tsx` - Enlaces a videoconferencias agregados
- `frontend/src/components/layout/Layout.tsx` - Sidebar abierto por defecto
- `frontend/src/App.tsx` - Rutas para video rooms y join room
- `frontend/src/hooks/useVideoRoom.ts` - Autenticación Socket.io agregada

### **Backend**
- `backend/src/index.ts` - Servidor principal con WebSockets
- `backend/src/models/User.ts` - Modelo de usuario con roles
- `backend/src/models/TherapySession.ts` - Modelo de sesiones
- `backend/src/routes/auth.ts` - Rutas de autenticación
- `backend/src/routes/sessions.ts` - Rutas de sesiones (CRUD completo)
- `backend/src/routes/students.ts` - Rutas de estudiantes (CRUD completo)
- `backend/src/routes/dashboard.ts` - Rutas del dashboard
- `backend/src/middleware/auth.ts` - Middleware de autenticación y autorización
- `backend/src/controllers/authController.ts` - Controlador de auth
- `backend/src/controllers/dashboardController.ts` - Controlador del dashboard
- `backend/src/controllers/sessionController.ts` - Controlador de sesiones
- `backend/src/controllers/studentController.ts` - Controlador de estudiantes
- `backend/src/sockets/socketHandlers.ts` - Handlers de WebSocket (configurado)
- `backend/scripts/populate-atlas.js` - Script para poblar base de datos

### **Frontend**
- `frontend/src/App.tsx` - App principal con routing
- `frontend/src/store/authStore.ts` - Store de autenticación con Zustand
- `frontend/src/pages/Dashboard.tsx` - Dashboard principal (FUNCIONAL)
- `frontend/src/pages/Sessions.tsx` - Gestión de sesiones (FUNCIONAL)
- `frontend/src/pages/Students.tsx` - Gestión de estudiantes (FUNCIONAL)
- `frontend/src/components/modals/CreateSessionModal.tsx` - Modal crear sesión
- `frontend/src/components/modals/EditSessionModal.tsx` - Modal editar sesión
- `frontend/src/components/modals/CreateStudentModal.tsx` - Modal crear estudiante
- `frontend/src/components/modals/EditStudentModal.tsx` - Modal editar estudiante
- `frontend/src/components/modals/StudentProgressModal.tsx` - Modal progreso estudiante
- `frontend/src/components/auth/AppInitializer.tsx` - Inicializador de app
- `frontend/src/components/layout/Sidebar.tsx` - Sidebar con navegación
- `frontend/src/components/layout/Header.tsx` - Header con usuario

## 🔑 **USUARIOS DE PRUEBA**
- **SLP**: test@test.com / test123
- **Child**: child@test.com / test123
- **SLP Admin**: kjgriman@gmail.com / test123

## 🚀 **ESTADO ACTUAL**
- ✅ **Backend**: Funcionando en puerto 3001
- ✅ **Frontend**: Funcionando en puerto 5173
- ✅ **MongoDB Atlas**: Conectado y poblado
- ✅ **Autenticación**: JWT funcionando
- ✅ **Dashboard**: Estadísticas en tiempo real
- ✅ **CRUD Sesiones**: Completo y funcional
- ✅ **CRUD Estudiantes**: Completo y funcional
- ✅ **WebSockets**: Configurado y listo
- 🎯 **Próximo**: Videollamadas WebRTC y juegos Phaser

## 🎯 **OBJETIVOS DEL CHALLENGE**

### **Completados ✅**
1. ✅ Landing page mejorada con shadcn/ui
2. ✅ Formulario de registro SLP completo
3. ✅ Conexión MongoDB Atlas
4. ✅ Autenticación funcional con JWT
5. ✅ Dashboard funcional con estadísticas en tiempo real
6. ✅ Sistema de sesiones completo (CRUD)
7. ✅ Gestión de estudiantes completo (CRUD)
8. ✅ WebSockets configurado y listo
9. ✅ Perfil de estudiante con visualización de progreso
10. ✅ Vista de casos (Caseload) - lista de estudiantes y métricas

### **En Progreso 🔄**
11. 🎯 Sistema de videollamadas WebRTC (DÍA 3)

### **Pendientes ⏳ (CHALLENGE REQUIREMENTS)**
12. **Juego interactivo con Phaser** (comunicación/lenguaje/habla)
13. **Sincronización WebSocket** para el juego
14. **Registro de datos de sesión** (correcto/incorrecto, porcentajes, notas)
15. **Scaffold para resumen de sesión con IA** (LLM API)
16. **Despliegue en plataforma cloud**

### **Progreso del Challenge**
- **Día 1**: ✅ Estructura base y autenticación
- **Día 2**: ✅ Dashboard y CRUD completo (80% del challenge)
- **Día 3**: 🎯 Videollamadas y juegos (OBJETIVO PRINCIPAL)
- **Día 4**: 🎯 WebSockets y sincronización
- **Día 5**: 🎯 Mejoras UX y optimizaciones
- **Día 6**: 🎯 Testing y preparación para producción
- **Día 7**: 🎯 Despliegue y documentación

### **Prioridades del Challenge**
- **Alta**: ✅ Dashboard, ✅ sistema de sesiones, 🎯 videollamadas WebRTC
- **Media**: 🎯 Juego Phaser, 🎯 WebSocket sync, 🎯 registro de datos
- **Baja**: ✅ Perfil estudiante, ✅ caseload, 🎯 resumen IA

## 📝 **NOTAS IMPORTANTES PARA EL AI**

### **Convenciones del Proyecto**
- **Evitar hacer HTTP requests directamente en componentes**: Para obtener datos de anuncios, llamar a un endpoint específico (a proporcionar) y filtrar por la sección llamada 'ads', o usar el payload de secciones recibido en el componente home y agregar la sección 'ads' en la lógica switch/if allí.
- **Preferencia del usuario**: Ejecutar MongoDB localmente en lugar de usar MongoDB Atlas o base de datos en memoria durante el desarrollo.

### **Estado Actual del Proyecto**
- **Backend**: Completamente funcional con MongoDB Atlas
- **Frontend**: Completamente funcional con todas las páginas principales
- **Autenticación**: JWT funcionando con persistencia
- **CRUD**: Sesiones y estudiantes completamente implementados
- **WebSockets**: Configurado y listo para implementar

### **Próximos Pasos (DÍA 3)**
1. **Videollamadas WebRTC**: Implementar usando PeerJS o similar
2. **Juegos Phaser**: Configurar Phaser.js y crear juego básico
3. **Sincronización**: Conectar WebSockets con juegos
4. **Integración**: Conectar videollamadas con sesiones existentes

### **Comandos para Continuar**
```bash
# Iniciar el proyecto
npm run dev

# Verificar estado
curl http://localhost:3001/health
curl http://localhost:5173

# Usuarios de prueba
# SLP: test@test.com / test123
# Child: child@test.com / test123
```
- **Scaffold**: Funcionalidades de IA (documentar cómo implementar)

## 📝 **CONVENCIONES DEL PROYECTO**

### **Código**
- Usar shadcn/ui para componentes UI
- Tailwind CSS para styling
- TypeScript strict mode
- Evitar HTTP requests directos en componentes
- Usar proxy de Vite para API calls

### **Preferencias del Usuario**
- MongoDB local (NO Atlas)
- shadcn/ui para componentes
- Respuestas en español
- Soluciones prácticas y funcionales

## 🚀 **PRÓXIMOS PASOS SUGERIDOS (CHALLENGE ROADMAP - 1 SEMANA)**

### **Día 1-2 - Prioridad Alta**
1. **Dashboard funcional** con datos reales de la API
2. **Sistema de videollamadas WebRTC** básico
3. **Páginas principales** (sessions, caseload, games)
4. **WebSocket setup** para sincronización

### **Día 3-4 - Prioridad Media**
5. **Juego Phaser básico** (comunicación/lenguaje)
6. **Sincronización WebSocket** para el juego
7. **Registro de sesiones** (correcto/incorrecto, notas)
8. **Perfil de estudiante** básico

### **Día 5-6 - Prioridad Baja**
9. **Vista de casos (Caseload)** con métricas
10. **Scaffold IA** (documentar implementación LLM)
11. **Despliegue** en plataforma cloud

### **Día 7 - Finalización**
12. **Testing y debugging**
13. **Documentación** y video demo
14. **README** con setup y arquitectura

### **Documentación Requerida**
- README con setup y arquitectura
- Comentarios sobre tradeoffs y decisiones técnicas
- Video demo de 5-10 minutos

## ⚠️ **IMPORTANTE PARA EL AI**

### **NO PREGUNTAR SOBRE**
- Configuración de shadcn/ui (ya está hecho)
- Configuración de MongoDB (ya está hecho)
- Problemas de autenticación (ya están resueltos)
- Estructura del proyecto (ya está definida)

### **SÍ PREGUNTAR SOBRE**
- Nuevas funcionalidades específicas
- Cambios en el diseño
- Nuevos componentes necesarios
- Integración de nuevas características

### **COMANDOS ÚTILES**
```bash
# Verificar base de datos
node scripts/explore-db.js

# Probar API
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}'

# Verificar puertos
netstat -an | findstr 3001
netstat -an | findstr 5173
```

## 🎯 **CONSIDERACIONES ESPECÍFICAS DEL CHALLENGE**

### **Enfoque MVP**
- **Simplicidad sobre perfección**: Funcionalidad core primero
- **Tradeoffs documentados**: Comentar decisiones técnicas
- **Uso extensivo de IA**: Pero revisar todo código generado
- **Base técnica sólida**: Arquitectura limpia y escalable

### **Tecnologías Específicas**
- **Videollamadas**: WebRTC nativo (gratuito, sin dependencias externas)
- **Juegos**: Phaser.js con WebSocket sync
- **Tiempo real**: Socket.io para sincronización
- **IA**: OpenAI API o similar para resúmenes (scaffold)

### **Entregables Clave**
- ✅ Aplicación desplegada y accesible
- ✅ Repositorio GitHub con código
- ✅ README con setup y arquitectura
- ✅ Video demo (5-10 min)
- ✅ Documentación de tradeoffs

### **Límites de Tiempo**
- **Máximo 7 días** de desarrollo
- **Check-ins regulares** con progreso
- **Priorizar funcionalidad** sobre pulido
- **Documentar tiempo** dedicado

---

**Última actualización**: 22 de Agosto, 2025
**Contexto válido hasta**: Finalización del challenge (7 días)
**Estado**: Videoconferencias parcialmente completadas, listo para continuar con WebRTC real y juegos interactivos

