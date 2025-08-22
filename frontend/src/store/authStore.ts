import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

// Tipos para el usuario
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'slp' | 'child';
  profilePicture?: string;
  slp?: {
    licenseNumber: string;
    specialization: string[];
    yearsOfExperience: number;
    caseloadCount: number;
  };
  child?: {
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    primaryGoals: string[];
    sessionsCompleted: number;
    totalSessionTime: number;
  };
}

// Tipos para el estado de autenticación
export interface AuthState {
  // Estado del usuario
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Estado de carga
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  
  // Estado de error
  error: string | null;
  
  // Acciones
  apiRequest: (endpoint: string, method?: string, body?: any) => Promise<any>;
  login: (email: string, password: string) => Promise<void>;
  registerSLP: (userData: SLPRegistrationData) => Promise<void>;
  registerChild: (userData: ChildRegistrationData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// Tipos para el registro
export interface SLPRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  specialization: string[];
  yearsOfExperience: number;
}

export interface ChildRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  parentEmail: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  primaryGoals: string[];
}

// API base URL - Usar proxy de Vite en desarrollo
// Si VITE_API_URL no está definida, usar cadena vacía para proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';


// Debug: Verificar la configuración del API
console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL,
  isDevelopment: import.meta.env.DEV
});

// Función para hacer requests a la API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  // Agregar token si existe
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
    (error as any).response = { data: errorData, status: response.status };
    throw error;
  }
  
  return response.json();
};

// Store de autenticación
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: false,
        isLoading: false,
        isLoggingIn: false,
        isRegistering: false,
        error: null,
        
        // Función para hacer requests a la API
        apiRequest: async (endpoint: string, method: string = 'GET', body?: any) => {
          const options: RequestInit = {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
          };
          
          if (body) {
            options.body = JSON.stringify(body);
          }
          
          return apiRequest(endpoint, options);
        },
        
        // Acción de login
        login: async (email: string, password: string) => {
          try {
            set({ isLoggingIn: true, error: null });
            
            const response = await apiRequest('/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            });
            
            if (response.success && response.data) {
              const { user, token } = response.data;
              
              // Guardar token en localStorage
              localStorage.setItem('auth_token', token);
              
              // Actualizar estado
              set({
                user,
                token,
                isAuthenticated: true,
                isLoggingIn: false,
                error: null,
              });
              
              // Log de login exitoso
              console.log('🔐 Usuario logueado exitosamente:', {
                userId: user.id,
                email: user.email,
                role: user.role,
                timestamp: new Date().toISOString(),
              });
            } else {
              throw new Error('Respuesta inválida del servidor');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el login';
            
            set({
              isLoggingIn: false,
              error: errorMessage,
            });
            
            console.error('❌ Error durante el login:', error);
            throw error;
          }
        },
        
        // Acción de registro SLP
        registerSLP: async (userData: SLPRegistrationData) => {
          try {
            set({ isRegistering: true, error: null });
            
            const response = await apiRequest('/auth/register/slp', {
              method: 'POST',
              body: JSON.stringify(userData),
            });
            
            if (response.success && response.data) {
              const { user, token } = response.data;
              
              // Guardar token en localStorage
              localStorage.setItem('auth_token', token);
              
              // Actualizar estado
              set({
                user,
                token,
                isAuthenticated: true,
                isRegistering: false,
                error: null,
              });
              
              // Log de registro exitoso
              console.log('✅ SLP registrado exitosamente:', {
                userId: user.id,
                email: user.email,
                licenseNumber: user.slp?.licenseNumber,
                timestamp: new Date().toISOString(),
              });
            } else {
              throw new Error('Respuesta inválida del servidor');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el registro';
            
            set({
              isRegistering: false,
              error: errorMessage,
            });
            
            console.error('❌ Error durante el registro SLP:', error);
            throw error;
          }
        },
        
        // Acción de registro Child
        registerChild: async (userData: ChildRegistrationData) => {
          try {
            set({ isRegistering: true, error: null });
            
            const response = await apiRequest('/auth/register/child', {
              method: 'POST',
              body: JSON.stringify(userData),
            });
            
            if (response.success && response.data) {
              const { user, token } = response.data;
              
              // Guardar token en localStorage
              localStorage.setItem('auth_token', token);
              
              // Actualizar estado
              set({
                user,
                token,
                isAuthenticated: true,
                isRegistering: false,
                error: null,
              });
              
              // Log de registro exitoso
              console.log('✅ Child registrado exitosamente:', {
                userId: user.id,
                email: user.email,
                skillLevel: user.child?.skillLevel,
                timestamp: new Date().toISOString(),
              });
            } else {
              throw new Error('Respuesta inválida del servidor');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el registro';
            
            set({
              isRegistering: false,
              error: errorMessage,
            });
            
            console.error('❌ Error durante el registro Child:', error);
            throw error;
          }
        },
        
        // Acción de logout
        logout: () => {
          // Remover token del localStorage
          localStorage.removeItem('auth_token');
          
          // Log de logout
          const currentUser = get().user;
          if (currentUser) {
            console.log('🔓 Usuario deslogueado:', {
              userId: currentUser.id,
              email: currentUser.email,
              timestamp: new Date().toISOString(),
            });
          }
          
          // Limpiar estado
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        },
        
        // Acción para limpiar errores
        clearError: () => {
          set({ error: null });
        },
        
        // Acción para establecer usuario
        setUser: (user: User) => {
          set({ user, isAuthenticated: true });
        },
        
        // Acción para establecer token
        setToken: (token: string) => {
          localStorage.setItem('auth_token', token);
          set({ token });
        },
        
        // Acción para actualizar usuario
        updateUser: (updates: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...updates };
            set({ user: updatedUser });
          }
        },
        
        // Acción para refrescar información del usuario
        refreshUser: async () => {
          try {
            set({ isLoading: true });
            
            const response = await apiRequest('/auth/me');
            
            if (response.success && response.data?.user) {
              set({ user: response.data.user });
            }
          } catch (error: any) {
            console.error('❌ Error refrescando usuario:', error);
            
            // Manejar específicamente el caso de usuario no encontrado
            if (error?.response?.data?.error?.code === 'USER_NOT_FOUND' || 
                error?.response?.data?.error?.shouldRedirect) {
              console.log('🔄 Usuario no encontrado en Atlas, cerrando sesión...');
              get().logout();
              return;
            }
            
            // Si hay error de autenticación, hacer logout
            if (error instanceof Error && error.message.includes('401')) {
              get().logout();
            }
          } finally {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          console.log('🔄 Rehidratando store:', state);
          // Marcar como inicializado inmediatamente
          if (state) {
            state.isInitialized = true;
            console.log('✅ Store inicializado');
          }
        },
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Selectores útiles
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useError = () => useAuthStore((state) => state.error);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsSLP = () => useAuthStore((state) => state.user?.role === 'slp');
export const useIsChild = () => useAuthStore((state) => state.user?.role === 'child');

// Hook personalizado para verificar permisos
export const useHasPermission = (permission: string) => {
  const user = useUser();
  
  if (!user) return false;
  
  // Lógica de permisos basada en el rol
  switch (permission) {
    case 'create_sessions':
      return user.role === 'slp';
    case 'join_sessions':
      return true; // Ambos roles pueden unirse a sesiones
    case 'manage_caseload':
      return user.role === 'slp';
    case 'view_progress':
      return true; // Ambos roles pueden ver progreso
    case 'edit_profile':
      return true; // Ambos roles pueden editar su perfil
    default:
      return false;
  }
};

// Hook para obtener el nombre completo del usuario
export const useFullName = () => {
  const user = useUser();
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
};

// Hook para obtener el nombre de display
export const useDisplayName = () => {
  const user = useUser();
  if (!user) return '';
  
  if (user.role === 'slp') {
    return `Dr. ${user.lastName}`;
  }
  
  return user.firstName;
};

// Hook para obtener la información del perfil
export const useProfileInfo = () => {
  const user = useUser();
  if (!user) return null;
  
  if (user.role === 'slp') {
    return {
      type: 'SLP',
      title: 'Terapeuta del Habla',
      details: {
        'Número de Licencia': user.slp?.licenseNumber,
        'Especializaciones': user.slp?.specialization?.join(', '),
        'Años de Experiencia': user.slp?.yearsOfExperience,
        'Estudiantes': user.slp?.caseloadCount,
      },
    };
  }
  
  if (user.role === 'child') {
    return {
      type: 'Estudiante',
      title: 'Estudiante de Terapia',
      details: {
        'Nivel de Habilidad': user.child?.skillLevel,
        'Objetivos': user.child?.primaryGoals?.join(', '),
        'Sesiones Completadas': user.child?.sessionsCompleted,
        'Tiempo Total': `${user.child?.totalSessionTime || 0} min`,
      },
    };
  }
  
  return null;
};


