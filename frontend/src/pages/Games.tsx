import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Play,
  BookOpen,
  Award,
  Star,
  Users,
  Clock,
  BarChart3,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Trophy,
  Target,
  Brain,
  Heart,
  Zap,
  Shield,
  Crown,
  Medal
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import GameContainer from '../components/games/GameContainer';

// Backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Tipos
interface Game {
  _id: string;
  name: string;
  description: string;
  category: 'vocabulary' | 'pronunciation' | 'comprehension' | 'fluency' | 'articulation';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // en minutos
  minAge: number;
  maxAge: number;
  image: string;
  isActive: boolean;
  totalPlays: number;
  averageScore: number;
  tags: string[];
}

interface GameProgress {
  gameId: string;
  gameName: string;
  lastPlayed: string;
  totalPlays: number;
  bestScore: number;
  averageScore: number;
  accuracy: number;
  timeSpent: number; // en minutos
}

interface GameAchievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'vocabulary' | 'pronunciation' | 'comprehension' | 'fluency' | 'articulation' | 'general';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
}

const Games: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'progress' | 'achievements'>('available');
  const [games, setGames] = useState<Game[]>([]);
  const [progress, setProgress] = useState<GameProgress[]>([]);
  const [achievements, setAchievements] = useState<GameAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showGame, setShowGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const { token, user } = useAuthStore();

  // Cargar juegos disponibles
  const loadGames = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/games`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGames(data.data.games || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || 'Error al cargar los juegos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Cargar progreso del usuario
  const loadProgress = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/games/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress || []);
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
    }
  };

  // Cargar logros del usuario
  const loadAchievements = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${BACKEND_URL}/games/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.data.achievements || []);
      }
    } catch (error) {
      console.error('Error cargando logros:', error);
    }
  };

  // Iniciar juego
  const handleStartGame = (game: Game) => {
    setSelectedGame(game);
    setShowGame(true);
  };

  // Cerrar juego
  const handleCloseGame = () => {
    setShowGame(false);
    setSelectedGame(null);
    // Recargar progreso después de jugar
    loadProgress();
  };

  // Filtrar juegos
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadGames();
      loadProgress();
      loadAchievements();
    }
  }, [token]);

  // Datos de ejemplo para demostración
  const demoGames: Game[] = [
    {
      _id: '1',
      name: 'Adivina la Palabra',
      description: 'Juego de vocabulario donde debes adivinar palabras basándote en imágenes',
      category: 'vocabulary',
      difficulty: 'easy',
      duration: 10,
      minAge: 5,
      maxAge: 12,
      image: '/images/games/word-guess.png',
      isActive: true,
      totalPlays: 1250,
      averageScore: 85,
      tags: ['vocabulario', 'imágenes', 'fácil']
    },
    {
      _id: '2',
      name: 'Sonidos del Habla',
      description: 'Practica la pronunciación de diferentes sonidos y fonemas',
      category: 'pronunciation',
      difficulty: 'medium',
      duration: 15,
      minAge: 6,
      maxAge: 15,
      image: '/images/games/speech-sounds.png',
      isActive: true,
      totalPlays: 890,
      averageScore: 78,
      tags: ['pronunciación', 'fonemas', 'intermedio']
    },
    {
      _id: '3',
      name: 'Comprensión Auditiva',
      description: 'Escucha historias cortas y responde preguntas de comprensión',
      category: 'comprehension',
      difficulty: 'hard',
      duration: 20,
      minAge: 8,
      maxAge: 16,
      image: '/images/games/listening.png',
      isActive: true,
      totalPlays: 650,
      averageScore: 72,
      tags: ['comprensión', 'auditivo', 'difícil']
    },
    {
      _id: '4',
      name: 'Fluidez en el Habla',
      description: 'Practica la fluidez con ejercicios de repetición y ritmo',
      category: 'fluency',
      difficulty: 'medium',
      duration: 12,
      minAge: 7,
      maxAge: 14,
      image: '/images/games/fluency.png',
      isActive: true,
      totalPlays: 420,
      averageScore: 81,
      tags: ['fluidez', 'ritmo', 'intermedio']
    },
    {
      _id: '5',
      name: 'Articulación Preciso',
      description: 'Mejora la articulación con ejercicios específicos de sonidos',
      category: 'articulation',
      difficulty: 'hard',
      duration: 18,
      minAge: 6,
      maxAge: 13,
      image: '/images/games/articulation.png',
      isActive: true,
      totalPlays: 320,
      averageScore: 75,
      tags: ['articulación', 'precisión', 'difícil']
    }
  ];

  const demoProgress: GameProgress[] = [
    {
      gameId: '1',
      gameName: 'Adivina la Palabra',
      lastPlayed: '2025-09-02T15:30:00Z',
      totalPlays: 8,
      bestScore: 95,
      averageScore: 87,
      accuracy: 92,
      timeSpent: 45
    },
    {
      gameId: '2',
      gameName: 'Sonidos del Habla',
      lastPlayed: '2025-09-01T10:15:00Z',
      totalPlays: 5,
      bestScore: 88,
      averageScore: 82,
      accuracy: 85,
      timeSpent: 30
    }
  ];

  const demoAchievements: GameAchievement[] = [
    {
      _id: '1',
      name: 'Primer Juego',
      description: 'Completa tu primer juego de terapia',
      icon: '🎮',
      category: 'general',
      points: 10,
      isUnlocked: true,
      unlockedAt: '2025-08-28T14:20:00Z',
      progress: 100
    },
    {
      _id: '2',
      name: 'Vocabulario Básico',
      description: 'Completa 10 juegos de vocabulario',
      icon: '📚',
      category: 'vocabulary',
      points: 25,
      isUnlocked: true,
      unlockedAt: '2025-08-30T16:45:00Z',
      progress: 100
    },
    {
      _id: '3',
      name: 'Pronunciación Perfecta',
      description: 'Obtén 100% de precisión en un juego de pronunciación',
      icon: '🎯',
      category: 'pronunciation',
      points: 50,
      isUnlocked: false,
      progress: 75
    },
    {
      _id: '4',
      name: 'Comprensión Avanzada',
      description: 'Completa 5 juegos de comprensión con más del 80%',
      icon: '🧠',
      category: 'comprehension',
      points: 30,
      isUnlocked: false,
      progress: 60
    }
  ];

  // Usar datos de ejemplo si no hay datos del backend
  const displayGames = games.length > 0 ? games : demoGames;
  const displayProgress = progress.length > 0 ? progress : demoProgress;
  const displayAchievements = achievements.length > 0 ? achievements : demoAchievements;

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'vocabulary', label: 'Vocabulario' },
    { value: 'pronunciation', label: 'Pronunciación' },
    { value: 'comprehension', label: 'Comprensión' },
    { value: 'fluency', label: 'Fluidez' },
    { value: 'articulation', label: 'Articulación' }
  ];

  const difficulties = [
    { value: 'all', label: 'Todas las dificultades' },
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Intermedio' },
    { value: 'hard', label: 'Difícil' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vocabulary': return <BookOpen className="w-4 h-4" />;
      case 'pronunciation': return <Target className="w-4 h-4" />;
      case 'comprehension': return <Brain className="w-4 h-4" />;
      case 'fluency': return <Zap className="w-4 h-4" />;
      case 'articulation': return <Shield className="w-4 h-4" />;
      default: return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Gamepad2 className="w-8 h-8 mr-3 text-primary-600" />
                Juegos de Terapia
              </h1>
              <p className="text-gray-600 mt-2">
                Ejercicios interactivos para mejorar el habla y el lenguaje
              </p>
            </div>
            
            {/* Estadísticas rápidas */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {displayGames.length}
                </div>
                <div className="text-sm text-gray-500">Juegos Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {displayProgress.length}
                </div>
                <div className="text-sm text-gray-500">Jugados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {displayAchievements.filter(a => a.isUnlocked).length}
                </div>
                <div className="text-sm text-gray-500">Logros</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'available', label: 'Juegos Disponibles', icon: Gamepad2 },
                { id: 'progress', label: 'Mi Progreso', icon: BarChart3 },
                { id: 'achievements', label: 'Logros', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las tabs */}
        <AnimatePresence mode="wait">
          {activeTab === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filtros */}
              <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar juegos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de juegos */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Cargando juegos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames.map((game) => (
                    <motion.div
                      key={game._id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Imagen del juego */}
                      <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                        <Gamepad2 className="w-16 h-16 text-primary-600" />
                      </div>
                      
                      {/* Contenido del juego */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                            {game.difficulty === 'easy' ? 'Fácil' : 
                             game.difficulty === 'medium' ? 'Intermedio' : 'Difícil'}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{game.description}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {game.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Estadísticas */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {game.duration} min
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {game.totalPlays}
                            </span>
                          </div>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {game.averageScore}%
                          </span>
                        </div>
                        
                        {/* Botón de jugar */}
                        <button
                          onClick={() => handleStartGame(game)}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Jugar Ahora</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Mi Progreso en Juegos</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {displayProgress.map((item) => (
                    <div key={item.gameId} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.gameName}</h3>
                          <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                            <span>Jugado {item.totalPlays} veces</span>
                            <span>Mejor puntuación: {item.bestScore}%</span>
                            <span>Promedio: {item.averageScore}%</span>
                            <span>Precisión: {item.accuracy}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Última vez</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(item.lastPlayed).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              const game = displayGames.find(g => g._id === item.gameId);
                              if (game) handleStartGame(game);
                            }}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Jugar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayAchievements.map((achievement) => (
                  <motion.div
                    key={achievement._id}
                    whileHover={{ y: -5 }}
                    className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                      achievement.isUnlocked 
                        ? 'border-success-200 bg-success-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`text-3xl ${achievement.isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${
                          achievement.isUnlocked ? 'text-success-800' : 'text-gray-900'
                        }`}>
                          {achievement.name}
                        </h3>
                        
                        <p className={`text-sm mt-1 ${
                          achievement.isUnlocked ? 'text-success-700' : 'text-gray-600'
                        }`}>
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-medium text-gray-500">
                            {achievement.points} puntos
                          </span>
                          
                          {achievement.isUnlocked ? (
                            <span className="text-xs font-medium text-success-600">
                              ¡Desbloqueado!
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-gray-500">
                              {achievement.progress}% completado
                            </span>
                          )}
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              achievement.isUnlocked 
                                ? 'bg-success-500' 
                                : 'bg-primary-500'
                            }`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal del juego */}
      {showGame && selectedGame && (
        <GameContainer
          sessionId={`game-${selectedGame._id}`}
          onClose={handleCloseGame}
        />
      )}
    </motion.div>
  );
};

export default Games;
