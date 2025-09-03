# 🏗️ DIAGRAMA DE ARQUITECTURA - PLATAFORMA DE TERAPIA DEL HABLA VIRTUAL

## 📊 **ARQUITECTURA GENERAL DEL SISTEMA**

```mermaid
graph TB
    %% Usuarios
    subgraph "👥 Usuarios"
        SLP[SLP - Terapeuta]
        CHILD[Child - Niño]
        ADMIN[Admin]
    end

    %% Frontend
    subgraph "🎨 Frontend (Vercel)"
        subgraph "React App"
            UI[UI Components<br/>shadcn/ui + Tailwind]
            ROUTER[React Router<br/>Protected Routes]
            STATE[Zustand Store<br/>Persistent State]
            WEBSOCKET_CLIENT[Socket.io Client<br/>Real-time]
        end
        
        subgraph "Build & Deploy"
            VITE[Vite Build<br/>TypeScript]
            CDN[Vercel CDN<br/>Global]
        end
    end

    %% Backend
    subgraph "⚙️ Backend (Railway)"
        subgraph "Express Server"
            API[API Routes<br/>RESTful]
            AUTH[Auth Middleware<br/>JWT + bcrypt]
            VALIDATION[Validation<br/>express-validator]
            RATE_LIMIT[Rate Limiting<br/>Security]
            CORS[CORS<br/>Cross-origin]
        end
        
        subgraph "WebSocket Server"
            SOCKET[Socket.io Server<br/>Real-time]
            GAME_HANDLERS[Game Handlers<br/>Phaser Sync]
            VIDEO_HANDLERS[Video Handlers<br/>WebRTC Signaling]
        end
        
        subgraph "Business Logic"
            CONTROLLERS[Controllers<br/>MVC Pattern]
            SERVICES[Services<br/>Business Logic]
            UTILS[Utils<br/>Helpers]
        end
    end

    %% Database
    subgraph "🗄️ Database (MongoDB Atlas)"
        subgraph "Collections"
            USERS[Users Collection<br/>SLP + Child]
            SESSIONS[Therapy Sessions<br/>CRUD Operations]
            VIDEO_ROOMS[Video Rooms<br/>WebRTC]
            GAMES[Games Data<br/>Phaser State]
        end
        
        subgraph "Indexes"
            EMAIL_IDX[Email Index<br/>Unique]
            LICENSE_IDX[License Index<br/>Unique]
            SESSION_IDX[Session Index<br/>Date + Status]
        end
    end

    %% External Services
    subgraph "🌐 External Services"
        JWT_SERVICE[JWT Service<br/>Token Management]
        EMAIL_SERVICE[Email Service<br/>Notifications]
        STORAGE[File Storage<br/>Assets + Media]
    end

    %% Connections
    SLP --> UI
    CHILD --> UI
    ADMIN --> UI
    
    UI --> ROUTER
    ROUTER --> STATE
    STATE --> WEBSOCKET_CLIENT
    
    WEBSOCKET_CLIENT --> SOCKET
    UI --> API
    
    API --> AUTH
    AUTH --> VALIDATION
    VALIDATION --> RATE_LIMIT
    RATE_LIMIT --> CORS
    CORS --> CONTROLLERS
    
    CONTROLLERS --> SERVICES
    SERVICES --> USERS
    SERVICES --> SESSIONS
    SERVICES --> VIDEO_ROOMS
    SERVICES --> GAMES
    
    SOCKET --> GAME_HANDLERS
    SOCKET --> VIDEO_HANDLERS
    GAME_HANDLERS --> GAMES
    VIDEO_HANDLERS --> VIDEO_ROOMS
    
    USERS --> EMAIL_IDX
    USERS --> LICENSE_IDX
    SESSIONS --> SESSION_IDX
    
    CONTROLLERS --> JWT_SERVICE
    SERVICES --> EMAIL_SERVICE
    UI --> STORAGE

    %% Styling
    classDef userStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef frontendStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef backendStyle fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef databaseStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef externalStyle fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class SLP,CHILD,ADMIN userStyle
    class UI,ROUTER,STATE,WEBSOCKET_CLIENT,VITE,CDN frontendStyle
    class API,AUTH,VALIDATION,RATE_LIMIT,CORS,SOCKET,GAME_HANDLERS,VIDEO_HANDLERS,CONTROLLERS,SERVICES,UTILS backendStyle
    class USERS,SESSIONS,VIDEO_ROOMS,GAMES,EMAIL_IDX,LICENSE_IDX,SESSION_IDX databaseStyle
    class JWT_SERVICE,EMAIL_SERVICE,STORAGE externalStyle
```

---

## 🔄 **FLUJO DE DATOS Y COMUNICACIÓN**

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant WS as WebSocket

    %% Autenticación
    U->>F: Login/Register
    F->>B: POST /auth/login
    B->>DB: Query User
    DB-->>B: User Data
    B->>B: bcrypt.compare()
    B-->>F: JWT Token
    F->>F: Store Token
    F-->>U: Dashboard

    %% WebSocket Connection
    F->>WS: Connect with JWT
    WS->>B: Validate Token
    B-->>WS: Valid
    WS-->>F: Connected

    %% CRUD Operations
    U->>F: Create Session
    F->>B: POST /api/sessions
    B->>B: Validate Input
    B->>DB: Insert Session
    DB-->>B: Success
    B->>WS: Broadcast Update
    WS-->>F: Real-time Update
    B-->>F: Session Created
    F-->>U: Success Message

    %% Real-time Features
    U->>F: Join Video Room
    F->>B: POST /api/video-rooms/join
    B->>DB: Update Room
    B->>WS: Notify Participants
    WS-->>F: Room Updated
    F->>WS: WebRTC Signaling
    WS-->>F: Peer Connection
    F-->>U: Video Call Active

    %% Game Synchronization
    U->>F: Start Game
    F->>WS: Game State Update
    WS->>B: Save Game State
    B->>DB: Store Game Data
    WS-->>F: Sync Game State
    F-->>U: Game Updated
```

---

## 🏢 **ARQUITECTURA DE DESPLIEGUE**

```mermaid
graph TB
    %% Internet
    subgraph "🌐 Internet"
        USERS[End Users<br/>SLP + Children]
    end

    %% CDN Layer
    subgraph "🚀 CDN Layer"
        VERCEL_CDN[Vercel CDN<br/>Global Distribution]
        RAILWAY_CDN[Railway CDN<br/>Edge Locations]
    end

    %% Application Layer
    subgraph "🎯 Application Layer"
        subgraph "Frontend (Vercel)"
            VERCEL_APP[React App<br/>Static Assets]
            VERCEL_FUNC[Vercel Functions<br/>Edge Runtime]
        end
        
        subgraph "Backend (Railway)"
            RAILWAY_APP[Node.js App<br/>Express Server]
            RAILWAY_WS[WebSocket Server<br/>Socket.io]
        end
    end

    %% Data Layer
    subgraph "🗄️ Data Layer"
        subgraph "MongoDB Atlas"
            ATLAS_CLUSTER[Atlas Cluster<br/>M0 Free Tier]
            ATLAS_BACKUP[Auto Backup<br/>Daily]
            ATLAS_MONITOR[Monitoring<br/>24/7]
        end
    end

    %% Infrastructure
    subgraph "⚙️ Infrastructure"
        GITHUB[GitHub<br/>Source Code]
        GITHUB_ACTIONS[GitHub Actions<br/>CI/CD]
        ENV_VARS[Environment Variables<br/>Secure]
    end

    %% Connections
    USERS --> VERCEL_CDN
    USERS --> RAILWAY_CDN
    
    VERCEL_CDN --> VERCEL_APP
    VERCEL_CDN --> VERCEL_FUNC
    RAILWAY_CDN --> RAILWAY_APP
    RAILWAY_CDN --> RAILWAY_WS
    
    VERCEL_APP --> RAILWAY_APP
    VERCEL_FUNC --> RAILWAY_APP
    VERCEL_APP --> RAILWAY_WS
    
    RAILWAY_APP --> ATLAS_CLUSTER
    RAILWAY_WS --> ATLAS_CLUSTER
    
    ATLAS_CLUSTER --> ATLAS_BACKUP
    ATLAS_CLUSTER --> ATLAS_MONITOR
    
    GITHUB --> GITHUB_ACTIONS
    GITHUB_ACTIONS --> VERCEL_APP
    GITHUB_ACTIONS --> RAILWAY_APP
    
    ENV_VARS --> VERCEL_APP
    ENV_VARS --> RAILWAY_APP

    %% Styling
    classDef userStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef cdnStyle fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef appStyle fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef dataStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef infraStyle fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px

    class USERS userStyle
    class VERCEL_CDN,RAILWAY_CDN cdnStyle
    class VERCEL_APP,VERCEL_FUNC,RAILWAY_APP,RAILWAY_WS appStyle
    class ATLAS_CLUSTER,ATLAS_BACKUP,ATLAS_MONITOR dataStyle
    class GITHUB,GITHUB_ACTIONS,ENV_VARS infraStyle
```

---

## 🔐 **ARQUITECTURA DE SEGURIDAD**

```mermaid
graph TB
    %% Client Side
    subgraph "🖥️ Client Security"
        HTTPS[HTTPS Only<br/>SSL/TLS]
        CSP[Content Security Policy<br/>XSS Prevention]
        CORS_CLIENT[CORS Headers<br/>Cross-origin]
        JWT_STORAGE[JWT Storage<br/>localStorage]
    end

    %% Network Security
    subgraph "🌐 Network Security"
        FIREWALL[Firewall<br/>Port Protection]
        RATE_LIMIT[Rate Limiting<br/>DDoS Protection]
        PROXY[Reverse Proxy<br/>Load Balancing]
    end

    %% Application Security
    subgraph "🛡️ Application Security"
        AUTH_MIDDLEWARE[Auth Middleware<br/>JWT Validation]
        INPUT_VALIDATION[Input Validation<br/>Sanitization]
        PASSWORD_HASH[Password Hashing<br/>bcrypt]
        HELMET[Helmet.js<br/>Security Headers]
    end

    %% Data Security
    subgraph "🔒 Data Security"
        ENCRYPTION[Data Encryption<br/>At Rest]
        BACKUP_ENCRYPT[Backup Encryption<br/>AES-256]
        ACCESS_CONTROL[Access Control<br/>Role-based]
        AUDIT_LOG[Audit Logging<br/>All Actions]
    end

    %% Compliance
    subgraph "📋 Compliance"
        HIPAA[HIPAA Ready<br/>Medical Standards]
        GDPR[GDPR Compliance<br/>Privacy]
        COOKIE_CONSENT[Cookie Consent<br/>User Privacy]
    end

    %% Connections
    HTTPS --> CSP
    CSP --> CORS_CLIENT
    CORS_CLIENT --> JWT_STORAGE
    
    FIREWALL --> RATE_LIMIT
    RATE_LIMIT --> PROXY
    
    AUTH_MIDDLEWARE --> INPUT_VALIDATION
    INPUT_VALIDATION --> PASSWORD_HASH
    PASSWORD_HASH --> HELMET
    
    ENCRYPTION --> BACKUP_ENCRYPT
    BACKUP_ENCRYPT --> ACCESS_CONTROL
    ACCESS_CONTROL --> AUDIT_LOG
    
    HIPAA --> GDPR
    GDPR --> COOKIE_CONSENT

    %% Styling
    classDef clientStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef networkStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef appStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef dataStyle fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef complianceStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class HTTPS,CSP,CORS_CLIENT,JWT_STORAGE clientStyle
    class FIREWALL,RATE_LIMIT,PROXY networkStyle
    class AUTH_MIDDLEWARE,INPUT_VALIDATION,PASSWORD_HASH,HELMET appStyle
    class ENCRYPTION,BACKUP_ENCRYPT,ACCESS_CONTROL,AUDIT_LOG dataStyle
    class HIPAA,GDPR,COOKIE_CONSENT complianceStyle
```

---

## 📱 **ARQUITECTURA DE COMPONENTES FRONTEND**

```mermaid
graph TB
    %% Layout Components
    subgraph "🏗️ Layout Components"
        LAYOUT[Layout Component<br/>Main Container]
        SIDEBAR[Sidebar<br/>Navigation]
        HEADER[Header<br/>User Info]
        FOOTER[Footer<br/>Links]
    end

    %% Page Components
    subgraph "📄 Page Components"
        DASHBOARD[Dashboard<br/>Statistics]
        LOGIN[Login Page<br/>Auth Forms]
        SESSIONS[Sessions Page<br/>CRUD Operations]
        STUDENTS[Students Page<br/>Management]
        VIDEO_ROOM[Video Room<br/>WebRTC]
        GAMES[Games Page<br/>Phaser]
    end

    %% UI Components
    subgraph "🎨 UI Components"
        subgraph "shadcn/ui"
            BUTTON[Button<br/>Interactive]
            MODAL[Modal<br/>Dialogs]
            FORM[Form<br/>Inputs]
            TABLE[Table<br/>Data Display]
            CHART[Chart<br/>Recharts]
        end
        
        subgraph "Custom Components"
            LOADING[Loading<br/>Spinners]
            ERROR[Error<br/>Boundaries]
            NOTIFICATION[Notification<br/>Toasts]
        end
    end

    %% State Management
    subgraph "💾 State Management"
        AUTH_STORE[Auth Store<br/>User State]
        SESSION_STORE[Session Store<br/>CRUD State]
        STUDENT_STORE[Student Store<br/>Data State]
        UI_STORE[UI Store<br/>Loading/Error]
    end

    %% Services
    subgraph "🔧 Services"
        API_SERVICE[API Service<br/>HTTP Client]
        SOCKET_SERVICE[Socket Service<br/>WebSocket]
        STORAGE_SERVICE[Storage Service<br/>localStorage]
        VALIDATION_SERVICE[Validation Service<br/>Forms]
    end

    %% Connections
    LAYOUT --> SIDEBAR
    LAYOUT --> HEADER
    LAYOUT --> FOOTER
    
    SIDEBAR --> DASHBOARD
    SIDEBAR --> SESSIONS
    SIDEBAR --> STUDENTS
    SIDEBAR --> VIDEO_ROOM
    SIDEBAR --> GAMES
    
    LOGIN --> FORM
    DASHBOARD --> CHART
    SESSIONS --> TABLE
    SESSIONS --> MODAL
    STUDENTS --> TABLE
    STUDENTS --> MODAL
    VIDEO_ROOM --> MODAL
    GAMES --> MODAL
    
    BUTTON --> LOADING
    FORM --> ERROR
    MODAL --> NOTIFICATION
    
    AUTH_STORE --> API_SERVICE
    SESSION_STORE --> API_SERVICE
    STUDENT_STORE --> API_SERVICE
    UI_STORE --> API_SERVICE
    
    VIDEO_ROOM --> SOCKET_SERVICE
    GAMES --> SOCKET_SERVICE
    
    AUTH_STORE --> STORAGE_SERVICE
    FORM --> VALIDATION_SERVICE

    %% Styling
    classDef layoutStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef pageStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef uiStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef stateStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef serviceStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class LAYOUT,SIDEBAR,HEADER,FOOTER layoutStyle
    class DASHBOARD,LOGIN,SESSIONS,STUDENTS,VIDEO_ROOM,GAMES pageStyle
    class BUTTON,MODAL,FORM,TABLE,CHART,LOADING,ERROR,NOTIFICATION uiStyle
    class AUTH_STORE,SESSION_STORE,STUDENT_STORE,UI_STORE stateStyle
    class API_SERVICE,SOCKET_SERVICE,STORAGE_SERVICE,VALIDATION_SERVICE serviceStyle
```

---

## ⚙️ **ARQUITECTURA DE SERVICIOS BACKEND**

```mermaid
graph TB
    %% Entry Points
    subgraph "🚪 Entry Points"
        HTTP_SERVER[HTTP Server<br/>Express.js]
        WS_SERVER[WebSocket Server<br/>Socket.io]
    end

    %% Middleware Layer
    subgraph "🛡️ Middleware Layer"
        CORS[CORS Middleware<br/>Cross-origin]
        AUTH[Auth Middleware<br/>JWT Validation]
        VALIDATION[Validation Middleware<br/>express-validator]
        RATE_LIMIT[Rate Limit Middleware<br/>Security]
        ERROR_HANDLER[Error Handler<br/>Global]
        LOGGER[Logger Middleware<br/>Request Logging]
    end

    %% Route Layer
    subgraph "🛣️ Route Layer"
        AUTH_ROUTES[Auth Routes<br/>/auth/*]
        SESSION_ROUTES[Session Routes<br/>/api/sessions/*]
        STUDENT_ROUTES[Student Routes<br/>/api/students/*]
        VIDEO_ROUTES[Video Routes<br/>/api/video-rooms/*]
        DASHBOARD_ROUTES[Dashboard Routes<br/>/api/dashboard/*]
    end

    %% Controller Layer
    subgraph "🎮 Controller Layer"
        AUTH_CONTROLLER[Auth Controller<br/>Login/Register]
        SESSION_CONTROLLER[Session Controller<br/>CRUD Operations]
        STUDENT_CONTROLLER[Student Controller<br/>Management]
        VIDEO_CONTROLLER[Video Controller<br/>Room Management]
        DASHBOARD_CONTROLLER[Dashboard Controller<br/>Statistics]
    end

    %% Service Layer
    subgraph "🔧 Service Layer"
        USER_SERVICE[User Service<br/>Business Logic]
        SESSION_SERVICE[Session Service<br/>Session Logic]
        STUDENT_SERVICE[Student Service<br/>Student Logic]
        VIDEO_SERVICE[Video Service<br/>Room Logic]
        STATS_SERVICE[Stats Service<br/>Analytics]
    end

    %% Data Layer
    subgraph "🗄️ Data Layer"
        USER_MODEL[User Model<br/>Mongoose Schema]
        SESSION_MODEL[Session Model<br/>Mongoose Schema]
        STUDENT_MODEL[Student Model<br/>Mongoose Schema]
        VIDEO_MODEL[Video Model<br/>Mongoose Schema]
    end

    %% WebSocket Handlers
    subgraph "🔌 WebSocket Handlers"
        GAME_HANDLER[Game Handler<br/>Phaser Sync]
        VIDEO_HANDLER[Video Handler<br/>WebRTC Signaling]
        CHAT_HANDLER[Chat Handler<br/>Real-time Chat]
    end

    %% Utilities
    subgraph "🛠️ Utilities"
        JWT_UTILS[JWT Utils<br/>Token Management]
        VALIDATION_UTILS[Validation Utils<br/>Custom Validators]
        RESPONSE_UTILS[Response Utils<br/>Standard Responses]
        ERROR_UTILS[Error Utils<br/>Custom Errors]
    end

    %% Connections
    HTTP_SERVER --> CORS
    WS_SERVER --> AUTH
    
    CORS --> AUTH
    AUTH --> VALIDATION
    VALIDATION --> RATE_LIMIT
    RATE_LIMIT --> ERROR_HANDLER
    ERROR_HANDLER --> LOGGER
    
    AUTH_ROUTES --> AUTH_CONTROLLER
    SESSION_ROUTES --> SESSION_CONTROLLER
    STUDENT_ROUTES --> STUDENT_CONTROLLER
    VIDEO_ROUTES --> VIDEO_CONTROLLER
    DASHBOARD_ROUTES --> DASHBOARD_CONTROLLER
    
    AUTH_CONTROLLER --> USER_SERVICE
    SESSION_CONTROLLER --> SESSION_SERVICE
    STUDENT_CONTROLLER --> STUDENT_SERVICE
    VIDEO_CONTROLLER --> VIDEO_SERVICE
    DASHBOARD_CONTROLLER --> STATS_SERVICE
    
    USER_SERVICE --> USER_MODEL
    SESSION_SERVICE --> SESSION_MODEL
    STUDENT_SERVICE --> STUDENT_MODEL
    VIDEO_SERVICE --> VIDEO_MODEL
    
    GAME_HANDLER --> SESSION_SERVICE
    VIDEO_HANDLER --> VIDEO_SERVICE
    CHAT_HANDLER --> USER_SERVICE
    
    AUTH_CONTROLLER --> JWT_UTILS
    VALIDATION --> VALIDATION_UTILS
    AUTH_CONTROLLER --> RESPONSE_UTILS
    ERROR_HANDLER --> ERROR_UTILS

    %% Styling
    classDef entryStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef middlewareStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef routeStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef controllerStyle fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef serviceStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef dataStyle fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    classDef wsStyle fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef utilStyle fill:#f1f8e9,stroke:#33691e,stroke-width:2px

    class HTTP_SERVER,WS_SERVER entryStyle
    class CORS,AUTH,VALIDATION,RATE_LIMIT,ERROR_HANDLER,LOGGER middlewareStyle
    class AUTH_ROUTES,SESSION_ROUTES,STUDENT_ROUTES,VIDEO_ROUTES,DASHBOARD_ROUTES routeStyle
    class AUTH_CONTROLLER,SESSION_CONTROLLER,STUDENT_CONTROLLER,VIDEO_CONTROLLER,DASHBOARD_CONTROLLER controllerStyle
    class USER_SERVICE,SESSION_SERVICE,STUDENT_SERVICE,VIDEO_SERVICE,STATS_SERVICE serviceStyle
    class USER_MODEL,SESSION_MODEL,STUDENT_MODEL,VIDEO_MODEL dataStyle
    class GAME_HANDLER,VIDEO_HANDLER,CHAT_HANDLER wsStyle
    class JWT_UTILS,VALIDATION_UTILS,RESPONSE_UTILS,ERROR_UTILS utilStyle
```

---

## 📊 **DIAGRAMA DE BASE DE DATOS**

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        String email UK "unique"
        String password "hashed"
        String firstName
        String lastName
        String role "slp|child"
        Date createdAt
        Date updatedAt
    }

    SLP_PROFILE {
        ObjectId _id PK
        ObjectId userId FK
        String licenseNumber UK "unique"
        Array specializations "articulation,language,fluency,voice,swallowing,cognitive"
        Number yearsOfExperience
        String bio
        Array certifications
    }

    CHILD_PROFILE {
        ObjectId _id PK
        ObjectId userId FK
        String parentEmail
        Number age
        String skillLevel "beginner|intermediate|advanced"
        String school
        String grade
        Array interests
    }

    THERAPY_SESSIONS {
        ObjectId _id PK
        String title
        String description
        Date scheduledDate
        Number duration "minutes"
        String status "scheduled|in-progress|completed|cancelled"
        ObjectId slpId FK
        ObjectId childId FK
        String notes
        Date createdAt
        Date updatedAt
    }

    VIDEO_ROOMS {
        ObjectId _id PK
        String roomCode UK "unique"
        String title
        ObjectId sessionId FK
        ObjectId createdBy FK
        Array participants
        String status "active|closed"
        Date createdAt
        Date updatedAt
    }

    GAMES {
        ObjectId _id PK
        String gameType "articulation|language|fluency|memory"
        String title
        String description
        Object difficulty "easy|medium|hard"
        Object gameData "Phaser game state"
        ObjectId sessionId FK
        Array scores
        Date createdAt
        Date updatedAt
    }

    SESSION_METRICS {
        ObjectId _id PK
        ObjectId sessionId FK
        Number correctAnswers
        Number totalQuestions
        Number accuracy "percentage"
        Number timeSpent "seconds"
        ObjectId childId FK
        Date createdAt
    }

    %% Relationships
    USERS ||--|| SLP_PROFILE : "has"
    USERS ||--|| CHILD_PROFILE : "has"
    
    THERAPY_SESSIONS ||--o{ SLP_PROFILE : "conducted_by"
    THERAPY_SESSIONS ||--o{ CHILD_PROFILE : "attended_by"
    
    VIDEO_ROOMS ||--o{ THERAPY_SESSIONS : "belongs_to"
    VIDEO_ROOMS ||--o{ USERS : "created_by"
    
    GAMES ||--o{ THERAPY_SESSIONS : "played_in"
    SESSION_METRICS ||--o{ THERAPY_SESSIONS : "tracks"
    SESSION_METRICS ||--o{ CHILD_PROFILE : "for_child"
```

---

## 🔄 **FLUJO DE DESARROLLO Y CI/CD**

```mermaid
graph TB
    %% Development
    subgraph "💻 Development"
        LOCAL_DEV[Local Development<br/>TypeScript + Vite]
        GIT_COMMIT[Git Commit<br/>Feature Branch]
        CODE_REVIEW[Code Review<br/>Pull Request]
    end

    %% CI/CD Pipeline
    subgraph "🚀 CI/CD Pipeline"
        GITHUB_ACTIONS[GitHub Actions<br/>Automated Workflow]
        TESTS[Run Tests<br/>Unit + Integration]
        BUILD[Build Process<br/>TypeScript Compilation]
        LINT[Linting<br/>ESLint + Prettier]
    end

    %% Deployment
    subgraph "🌐 Deployment"
        VERCEL_DEPLOY[Vercel Deploy<br/>Frontend]
        RAILWAY_DEPLOY[Railway Deploy<br/>Backend]
        DB_MIGRATION[Database Migration<br/>MongoDB Atlas]
    end

    %% Monitoring
    subgraph "📊 Monitoring"
        HEALTH_CHECK[Health Checks<br/>Uptime Monitoring]
        ERROR_TRACKING[Error Tracking<br/>Logs]
        PERFORMANCE[Performance Monitoring<br/>Metrics]
    end

    %% Connections
    LOCAL_DEV --> GIT_COMMIT
    GIT_COMMIT --> CODE_REVIEW
    CODE_REVIEW --> GITHUB_ACTIONS
    
    GITHUB_ACTIONS --> TESTS
    TESTS --> BUILD
    BUILD --> LINT
    LINT --> VERCEL_DEPLOY
    LINT --> RAILWAY_DEPLOY
    
    VERCEL_DEPLOY --> HEALTH_CHECK
    RAILWAY_DEPLOY --> HEALTH_CHECK
    RAILWAY_DEPLOY --> DB_MIGRATION
    
    HEALTH_CHECK --> ERROR_TRACKING
    ERROR_TRACKING --> PERFORMANCE

    %% Styling
    classDef devStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef cicdStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef deployStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef monitorStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px

    class LOCAL_DEV,GIT_COMMIT,CODE_REVIEW devStyle
    class GITHUB_ACTIONS,TESTS,BUILD,LINT cicdStyle
    class VERCEL_DEPLOY,RAILWAY_DEPLOY,DB_MIGRATION deployStyle
    class HEALTH_CHECK,ERROR_TRACKING,PERFORMANCE monitorStyle
```

---

## 📈 **MÉTRICAS Y MONITOREO**

```mermaid
graph TB
    %% Application Metrics
    subgraph "📊 Application Metrics"
        RESPONSE_TIME[Response Time<br/>< 200ms]
        THROUGHPUT[Throughput<br/>Requests/sec]
        ERROR_RATE[Error Rate<br/>< 1%]
        UPTIME[Uptime<br/>> 99.5%]
    end

    %% User Metrics
    subgraph "👥 User Metrics"
        ACTIVE_USERS[Active Users<br/>Daily/Monthly]
        SESSION_DURATION[Session Duration<br/>Average Time]
        RETENTION[Retention Rate<br/>User Return]
        CONVERSION[Conversion Rate<br/>Signup to Use]
    end

    %% Business Metrics
    subgraph "💼 Business Metrics"
        SESSIONS_COMPLETED[Sessions Completed<br/>Total Count]
        THERAPY_HOURS[Therapy Hours<br/>Total Time]
        STUDENT_PROGRESS[Student Progress<br/>Improvement]
        SLP_EFFICIENCY[SLP Efficiency<br/>Cases Managed]
    end

    %% Technical Metrics
    subgraph "⚙️ Technical Metrics"
        BUNDLE_SIZE[Bundle Size<br/>< 500KB]
        LOAD_TIME[Load Time<br/>< 2s]
        MEMORY_USAGE[Memory Usage<br/>Heap Size]
        CPU_USAGE[CPU Usage<br/>Server Load]
    end

    %% Monitoring Tools
    subgraph "🔍 Monitoring Tools"
        RAILWAY_LOGS[Railway Logs<br/>Application Logs]
        VERCEL_ANALYTICS[Vercel Analytics<br/>Performance]
        MONGODB_MONITOR[MongoDB Monitor<br/>Database]
        CUSTOM_METRICS[Custom Metrics<br/>Business Logic]
    end

    %% Alerts
    subgraph "🚨 Alerts"
        ERROR_ALERTS[Error Alerts<br/>High Error Rate]
        PERFORMANCE_ALERTS[Performance Alerts<br/>Slow Response]
        UPTIME_ALERTS[Uptime Alerts<br/>Service Down]
        BUSINESS_ALERTS[Business Alerts<br/>Low Activity]
    end

    %% Connections
    RESPONSE_TIME --> RAILWAY_LOGS
    THROUGHPUT --> VERCEL_ANALYTICS
    ERROR_RATE --> ERROR_ALERTS
    UPTIME --> UPTIME_ALERTS
    
    ACTIVE_USERS --> CUSTOM_METRICS
    SESSION_DURATION --> CUSTOM_METRICS
    RETENTION --> CUSTOM_METRICS
    CONVERSION --> CUSTOM_METRICS
    
    SESSIONS_COMPLETED --> BUSINESS_ALERTS
    THERAPY_HOURS --> CUSTOM_METRICS
    STUDENT_PROGRESS --> CUSTOM_METRICS
    SLP_EFFICIENCY --> CUSTOM_METRICS
    
    BUNDLE_SIZE --> VERCEL_ANALYTICS
    LOAD_TIME --> VERCEL_ANALYTICS
    MEMORY_USAGE --> RAILWAY_LOGS
    CPU_USAGE --> RAILWAY_LOGS
    
    MONGODB_MONITOR --> PERFORMANCE_ALERTS
    CUSTOM_METRICS --> BUSINESS_ALERTS

    %% Styling
    classDef appStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef userStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef businessStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef techStyle fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef monitorStyle fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef alertStyle fill:#fff8e1,stroke:#f57f17,stroke-width:2px

    class RESPONSE_TIME,THROUGHPUT,ERROR_RATE,UPTIME appStyle
    class ACTIVE_USERS,SESSION_DURATION,RETENTION,CONVERSION userStyle
    class SESSIONS_COMPLETED,THERAPY_HOURS,STUDENT_PROGRESS,SLP_EFFICIENCY businessStyle
    class BUNDLE_SIZE,LOAD_TIME,MEMORY_USAGE,CPU_USAGE techStyle
    class RAILWAY_LOGS,VERCEL_ANALYTICS,MONGODB_MONITOR,CUSTOM_METRICS monitorStyle
    class ERROR_ALERTS,PERFORMANCE_ALERTS,UPTIME_ALERTS,BUSINESS_ALERTS alertStyle
```

---

*Diagramas generados para presentación del proyecto - Plataforma de Terapia del Habla Virtual*  
*Fecha: Agosto 2025*  
*Versión: 1.0*


