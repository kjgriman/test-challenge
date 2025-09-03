import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Save,
  Play,
  Square,
  Settings,
  Layers,
  Image,
  Type,
  Music,
  Volume2,
  Palette,
  Grid,
  RotateCcw,
  Eye,
  EyeOff,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Code,
  Zap,
  Target,
  Brain,
  BookOpen,
  Shield,
  Star
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import GameEditor from '../components/game-editor/GameEditor';
import GamePreview from '../components/game-editor/GamePreview';
import AssetLibrary from '../components/game-editor/AssetLibrary';
import GameProperties from '../components/game-editor/GameProperties';
import LayerPanel from '../components/game-editor/LayerPanel';

// Backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

// Tipos
interface GameAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'text' | 'animation';
  url: string;
  category: string;
  tags: string[];
}

interface GameObject {
  id: string;
  type: 'sprite' | 'text' | 'button' | 'audio' | 'background';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scale: { x: number; y: number };
  visible: boolean;
  properties: {
    text?: string;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    imageUrl?: string;
    audioUrl?: string;
    interactive?: boolean;
    onClick?: string;
    onHover?: string;
    animation?: string;
    [key: string]: any;
  };
}

interface GameScene {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: string;
  objects: GameObject[];
  physics?: {
    enabled: boolean;
    gravity: { x: number; y: number };
  };
}

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: 'vocabulary' | 'pronunciation' | 'comprehension' | 'fluency' | 'articulation';
  difficulty: 'easy' | 'medium' | 'hard';
  thumbnail: string;
  scenes: GameScene[];
  assets: GameAsset[];
}

const CreateGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'assets' | 'properties'>('editor');
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [currentScene, setCurrentScene] = useState<GameScene | null>(null);
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameCategory, setGameCategory] = useState<'vocabulary' | 'pronunciation' | 'comprehension' | 'fluency' | 'articulation'>('vocabulary');
  const [gameDifficulty, setGameDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  const { token, user } = useAuthStore();

  // Templates de ejemplo
  const gameTemplates: GameTemplate[] = [
    {
      id: 'vocabulary-quiz',
      name: 'Quiz de Vocabulario',
      description: 'Juego de preguntas y respuestas con imágenes',
      category: 'vocabulary',
      difficulty: 'easy',
      thumbnail: '/images/templates/vocabulary-quiz.png',
      scenes: [
        {
          id: 'main-scene',
          name: 'Escena Principal',
          width: 800,
          height: 600,
          backgroundColor: '#87CEEB',
          objects: [
            {
              id: 'background',
              type: 'background',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                imageUrl: '/images/backgrounds/classroom.png'
              }
            },
            {
              id: 'title',
              type: 'text',
              x: 400,
              y: 50,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                text: 'Adivina la Palabra',
                fontSize: 48,
                color: '#FFFFFF',
                fontFamily: 'Arial'
              }
            },
            {
              id: 'question-card',
              type: 'sprite',
              x: 400,
              y: 200,
              width: 300,
              height: 200,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                imageUrl: '/images/cards/question-card.png',
                interactive: true
              }
            }
          ]
        }
      ],
      assets: [
        {
          id: 'classroom-bg',
          name: 'Aula de Clase',
          type: 'image',
          url: '/images/backgrounds/classroom.png',
          category: 'backgrounds',
          tags: ['aula', 'escuela', 'educación']
        }
      ]
    },
    {
      id: 'pronunciation-practice',
      name: 'Práctica de Pronunciación',
      description: 'Ejercicios de fonemas con feedback visual',
      category: 'pronunciation',
      difficulty: 'medium',
      thumbnail: '/images/templates/pronunciation-practice.png',
      scenes: [
        {
          id: 'main-scene',
          name: 'Escena Principal',
          width: 800,
          height: 600,
          backgroundColor: '#98FB98',
          objects: [
            {
              id: 'background',
              type: 'background',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                imageUrl: '/images/backgrounds/nature.png'
              }
            },
            {
              id: 'sound-wave',
              type: 'sprite',
              x: 400,
              y: 300,
              width: 200,
              height: 100,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                imageUrl: '/images/ui/sound-wave.png',
                animation: 'wave'
              }
            }
          ]
        }
      ],
      assets: []
    },
    {
      id: 'comprehension-story',
      name: 'Historia Interactiva',
      description: 'Cuentos con preguntas de comprensión',
      category: 'comprehension',
      difficulty: 'hard',
      thumbnail: '/images/templates/comprehension-story.png',
      scenes: [
        {
          id: 'main-scene',
          name: 'Escena Principal',
          width: 800,
          height: 600,
          backgroundColor: '#F0E68C',
          objects: [
            {
              id: 'story-background',
              type: 'background',
              x: 0,
              y: 0,
              width: 800,
              height: 600,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                imageUrl: '/images/backgrounds/story.png'
              }
            },
            {
              id: 'story-text',
              type: 'text',
              x: 400,
              y: 500,
              rotation: 0,
              scale: { x: 1, y: 1 },
              visible: true,
              properties: {
                text: 'Había una vez...',
                fontSize: 24,
                color: '#000000',
                fontFamily: 'Arial'
              }
            }
          ]
        }
      ],
      assets: []
    }
  ];

  // Inicializar escena por defecto
  useEffect(() => {
    if (!currentScene) {
      setCurrentScene({
        id: 'main-scene',
        name: 'Escena Principal',
        width: 800,
        height: 600,
        backgroundColor: '#87CEEB',
        objects: []
      });
    }
  }, [currentScene]);

  // Seleccionar template
  const handleSelectTemplate = (template: GameTemplate) => {
    setSelectedTemplate(template);
    setCurrentScene(template.scenes[0]);
    setGameName(template.name);
    setGameDescription(template.description);
    setGameCategory(template.category);
    setGameDifficulty(template.difficulty);
    setShowTemplates(false);
  };

  // Guardar juego
  const handleSaveGame = async () => {
    if (!token || !currentScene) return;

    try {
      const gameData = {
        name: gameName,
        description: gameDescription,
        category: gameCategory,
        difficulty: gameDifficulty,
        scenes: [currentScene],
        assets: selectedTemplate?.assets || []
      };

      const response = await fetch(`${BACKEND_URL}/api/games`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });

      if (response.ok) {
        console.log('Juego guardado exitosamente');
        setShowSaveDialog(false);
      } else {
        console.error('Error al guardar el juego');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

  // Agregar objeto a la escena
  const handleAddObject = (objectType: string) => {
    if (!currentScene) return;

    const newObject: GameObject = {
      id: `object-${Date.now()}`,
      type: objectType as any,
      x: 400,
      y: 300,
      width: 100,
      height: 100,
      rotation: 0,
      scale: { x: 1, y: 1 },
      visible: true,
      properties: {
        text: objectType === 'text' ? 'Texto' : '',
        fontSize: 24,
        color: '#000000',
        fontFamily: 'Arial',
        interactive: objectType === 'button'
      }
    };

    setCurrentScene({
      ...currentScene,
      objects: [...currentScene.objects, newObject]
    });
    setSelectedObject(newObject);
  };

  // Actualizar objeto seleccionado
  const handleUpdateObject = (updatedObject: GameObject) => {
    if (!currentScene) return;

    setCurrentScene({
      ...currentScene,
      objects: currentScene.objects.map(obj => 
        obj.id === updatedObject.id ? updatedObject : obj
      )
    });
    setSelectedObject(updatedObject);
  };

  // Eliminar objeto
  const handleDeleteObject = (objectId: string) => {
    if (!currentScene) return;

    setCurrentScene({
      ...currentScene,
      objects: currentScene.objects.filter(obj => obj.id !== objectId)
    });
    setSelectedObject(null);
  };

  const categories = [
    { value: 'vocabulary', label: 'Vocabulario', icon: BookOpen },
    { value: 'pronunciation', label: 'Pronunciación', icon: Target },
    { value: 'comprehension', label: 'Comprensión', icon: Brain },
    { value: 'fluency', label: 'Fluidez', icon: Zap },
    { value: 'articulation', label: 'Articulación', icon: Shield }
  ];

  const difficulties = [
    { value: 'easy', label: 'Fácil', color: 'text-green-600' },
    { value: 'medium', label: 'Intermedio', color: 'text-yellow-600' },
    { value: 'hard', label: 'Difícil', color: 'text-red-600' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="flex h-screen">
        {/* Sidebar izquierdo - Herramientas */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Editor de Juegos
            </h2>
          </div>

          {/* Tabs de herramientas */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'editor', label: 'Editor', icon: Edit },
              { id: 'preview', label: 'Vista Previa', icon: Eye },
              { id: 'assets', label: 'Biblioteca', icon: FolderOpen },
              { id: 'properties', label: 'Propiedades', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mx-auto mb-1" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido de las herramientas */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4"
                >
                  {/* Herramientas de dibujo */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Herramientas</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'sprite', icon: Image, label: 'Imagen' },
                        { type: 'text', icon: Type, label: 'Texto' },
                        { type: 'button', icon: Target, label: 'Botón' },
                        { type: 'audio', icon: Music, label: 'Audio' }
                      ].map((tool) => (
                        <button
                          key={tool.type}
                          onClick={() => handleAddObject(tool.type)}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <tool.icon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                          <span className="text-xs text-gray-600">{tool.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Panel de capas */}
                  {showLayerPanel && (
                    <LayerPanel
                      objects={currentScene?.objects || []}
                      selectedObject={selectedObject}
                      onSelectObject={setSelectedObject}
                      onDeleteObject={handleDeleteObject}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4"
                >
                  <GamePreview
                    scene={currentScene}
                    isPreviewMode={isPreviewMode}
                  />
                </motion.div>
              )}

              {activeTab === 'assets' && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4"
                >
                  <AssetLibrary
                    assets={selectedTemplate?.assets || []}
                    onSelectAsset={(asset) => {
                      // Implementar selección de asset
                      console.log('Asset seleccionado:', asset);
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'properties' && (
                <motion.div
                  key="properties"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4"
                >
                  <GameProperties
                    scene={currentScene}
                    selectedObject={selectedObject}
                    onUpdateScene={setCurrentScene}
                    onUpdateObject={handleUpdateObject}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Área principal */}
        <div className="flex-1 flex flex-col">
          {/* Header principal */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowTemplates(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Juego</span>
                </button>

                {selectedTemplate && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Template:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedTemplate.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                    isPreviewMode
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>Vista Previa</span>
                </button>

                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Área de edición */}
          <div className="flex-1 flex">
            {/* Editor principal */}
            <div className="flex-1 p-4">
              <GameEditor
                scene={currentScene}
                selectedObject={selectedObject}
                isPreviewMode={isPreviewMode}
                onUpdateScene={setCurrentScene}
                onSelectObject={setSelectedObject}
              />
            </div>

            {/* Panel derecho - Propiedades del objeto */}
            {showPropertiesPanel && selectedObject && (
              <div className="w-80 bg-white border-l border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Propiedades del Objeto
                </h3>
                <GameProperties
                  scene={currentScene}
                  selectedObject={selectedObject}
                  onUpdateScene={setCurrentScene}
                  onUpdateObject={handleUpdateObject}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Seleccionar Template</h2>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gameTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ y: -5 }}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                        <Gamepad2 className="w-16 h-16 text-primary-600" />
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.difficulty === 'easy' ? 'text-green-600 bg-green-100' :
                            template.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {template.difficulty === 'easy' ? 'Fácil' :
                             template.difficulty === 'medium' ? 'Intermedio' : 'Difícil'}
                          </span>
                          
                          <span className="text-xs text-gray-500">
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de guardar */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Guardar Juego</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Juego
                    </label>
                    <input
                      type="text"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ingresa el nombre del juego"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={gameDescription}
                      onChange={(e) => setGameDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe el juego"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={gameCategory}
                      onChange={(e) => setGameCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dificultad
                    </label>
                    <select
                      value={gameDifficulty}
                      onChange={(e) => setGameDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {difficulties.map((difficulty) => (
                        <option key={difficulty.value} value={difficulty.value}>
                          {difficulty.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveGame}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Juego</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreateGame;
