import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChromePicker } from 'react-color';
import {
  Settings,
  Type,
  Image,
  Music,
  Eye,
  EyeOff,
  RotateCw,
  Move,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Zap,
  Target,
  Layers,
  Palette,
  Volume2,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';

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

interface GamePropertiesProps {
  scene: GameScene | null;
  selectedObject: GameObject | null;
  onUpdateScene: (scene: GameScene) => void;
  onUpdateObject: (object: GameObject) => void;
}

const GameProperties: React.FC<GamePropertiesProps> = ({
  scene,
  selectedObject,
  onUpdateScene,
  onUpdateObject
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState<'text' | 'background'>('text');

  if (!selectedObject) {
    return (
      <div className="text-center py-8">
        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sin objeto seleccionado
        </h3>
        <p className="text-gray-600 text-sm">
          Selecciona un objeto para ver sus propiedades
        </p>
      </div>
    );
  }

  const updateObjectProperty = (property: string, value: any) => {
    const updatedObject = {
      ...selectedObject,
      properties: {
        ...selectedObject.properties,
        [property]: value
      }
    };
    onUpdateObject(updatedObject);
  };

  const updateObjectTransform = (property: string, value: number) => {
    const updatedObject = {
      ...selectedObject,
      [property]: value
    };
    onUpdateObject(updatedObject);
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'sprite': return <Image className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'button': return <Target className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'background': return <Layers className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Comic Sans MS',
    'Impact',
    'Tahoma',
    'Trebuchet MS'
  ];

  const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

  return (
    <div className="space-y-6">
      {/* Header del objeto */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-2 mb-2">
          {getObjectIcon(selectedObject.type)}
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          ID: {selectedObject.id}
        </p>
      </div>

      {/* Propiedades básicas */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Transformación</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Posición X
            </label>
            <input
              type="number"
              value={selectedObject.x}
              onChange={(e) => updateObjectTransform('x', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Posición Y
            </label>
            <input
              type="number"
              value={selectedObject.y}
              onChange={(e) => updateObjectTransform('y', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Ancho
            </label>
            <input
              type="number"
              value={selectedObject.width || 100}
              onChange={(e) => updateObjectTransform('width', parseFloat(e.target.value) || 100)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Alto
            </label>
            <input
              type="number"
              value={selectedObject.height || 100}
              onChange={(e) => updateObjectTransform('height', parseFloat(e.target.value) || 100)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Rotación
            </label>
            <input
              type="number"
              value={selectedObject.rotation}
              onChange={(e) => updateObjectTransform('rotation', parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Escala
            </label>
            <input
              type="number"
              value={selectedObject.scale.x}
              onChange={(e) => {
                const scale = parseFloat(e.target.value) || 1;
                updateObjectTransform('scale', { x: scale, y: scale });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateObjectTransform('visible', !selectedObject.visible)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
              selectedObject.visible
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {selectedObject.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{selectedObject.visible ? 'Visible' : 'Oculto'}</span>
          </button>
        </div>
      </div>

      {/* Propiedades específicas por tipo */}
      {selectedObject.type === 'text' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Texto</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <textarea
              value={selectedObject.properties.text || ''}
              onChange={(e) => updateObjectProperty('text', e.target.value)}
              rows={3}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ingresa el texto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tamaño de fuente
              </label>
              <select
                value={selectedObject.properties.fontSize || 24}
                onChange={(e) => updateObjectProperty('fontSize', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {fontSizeOptions.map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Familia de fuente
              </label>
              <select
                value={selectedObject.properties.fontFamily || 'Arial'}
                onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Color del texto
            </label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: selectedObject.properties.color || '#000000' }}
                onClick={() => {
                  setColorPickerType('text');
                  setShowColorPicker(!showColorPicker);
                }}
              />
              <input
                type="text"
                value={selectedObject.properties.color || '#000000'}
                onChange={(e) => updateObjectProperty('color', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {showColorPicker && colorPickerType === 'text' && (
              <div className="absolute z-10 mt-2">
                <ChromePicker
                  color={selectedObject.properties.color || '#000000'}
                  onChange={(color) => updateObjectProperty('color', color.hex)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {selectedObject.type === 'sprite' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Sprite</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="text"
              value={selectedObject.properties.imageUrl || ''}
              onChange={(e) => updateObjectProperty('imageUrl', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://ejemplo.com/imagen.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="interactive"
              checked={selectedObject.properties.interactive || false}
              onChange={(e) => updateObjectProperty('interactive', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="interactive" className="text-sm text-gray-700">
              Interactivo
            </label>
          </div>
        </div>
      )}

      {selectedObject.type === 'button' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Botón</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Texto del botón
            </label>
            <input
              type="text"
              value={selectedObject.properties.text || ''}
              onChange={(e) => updateObjectProperty('text', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Texto del botón"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Acción al hacer clic
            </label>
            <select
              value={selectedObject.properties.onClick || ''}
              onChange={(e) => updateObjectProperty('onClick', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sin acción</option>
              <option value="play_sound">Reproducir sonido</option>
              <option value="change_scene">Cambiar escena</option>
              <option value="show_message">Mostrar mensaje</option>
              <option value="custom">Acción personalizada</option>
            </select>
          </div>
        </div>
      )}

      {selectedObject.type === 'audio' && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Audio</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL del audio
            </label>
            <input
              type="text"
              value={selectedObject.properties.audioUrl || ''}
              onChange={(e) => updateObjectProperty('audioUrl', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://ejemplo.com/audio.mp3"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md text-sm">
              <Play className="w-4 h-4" />
              <span>Reproducir</span>
            </button>
            
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm">
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </button>
          </div>
        </div>
      )}

      {/* Propiedades de la escena */}
      {scene && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900">Escena</h4>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Color de fondo
            </label>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: scene.backgroundColor }}
                onClick={() => {
                  setColorPickerType('background');
                  setShowColorPicker(!showColorPicker);
                }}
              />
              <input
                type="text"
                value={scene.backgroundColor}
                onChange={(e) => onUpdateScene({ ...scene, backgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {showColorPicker && colorPickerType === 'background' && (
              <div className="absolute z-10 mt-2">
                <ChromePicker
                  color={scene.backgroundColor}
                  onChange={(color) => onUpdateScene({ ...scene, backgroundColor: color.hex })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ancho
              </label>
              <input
                type="number"
                value={scene.width}
                onChange={(e) => onUpdateScene({ ...scene, width: parseInt(e.target.value) || 800 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alto
              </label>
              <input
                type="number"
                value={scene.height}
                onChange={(e) => onUpdateScene({ ...scene, height: parseInt(e.target.value) || 600 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameProperties;
