import React from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Eye, EyeOff } from 'lucide-react';

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

interface GamePreviewProps {
  scene: GameScene | null;
  isPreviewMode: boolean;
}

const GamePreview: React.FC<GamePreviewProps> = ({ scene, isPreviewMode }) => {
  if (!scene) {
    return (
      <div className="text-center py-8">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sin escena para previsualizar
        </h3>
        <p className="text-gray-600 text-sm">
          Selecciona una escena para ver la vista previa
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Vista Previa</h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200">
            <Play className="w-4 h-4" />
          </button>
          <button className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
            <Square className="w-4 h-4" />
          </button>
          <button className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área de previsualización */}
      <div 
        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: scene.width,
          height: scene.height,
          backgroundColor: scene.backgroundColor,
          maxWidth: '100%',
          maxHeight: '400px'
        }}
      >
        {/* Renderizar objetos */}
        {scene.objects.filter(obj => obj.visible).map((obj) => (
          <div
            key={obj.id}
            className="absolute"
            style={{
              left: obj.x,
              top: obj.y,
              width: obj.width || 100,
              height: obj.height || 100,
              transform: `rotate(${obj.rotation}deg) scale(${obj.scale.x}, ${obj.scale.y})`,
              transformOrigin: 'center'
            }}
          >
            {obj.type === 'text' && (
              <div
                className="text-center"
                style={{
                  fontSize: obj.properties.fontSize || 24,
                  color: obj.properties.color || '#000000',
                  fontFamily: obj.properties.fontFamily || 'Arial',
                  lineHeight: 1
                }}
              >
                {obj.properties.text || 'Texto'}
              </div>
            )}
            
            {obj.type === 'sprite' && (
              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                {obj.properties.imageUrl ? (
                  <img
                    src={obj.properties.imageUrl}
                    alt="Sprite"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-xs">Sprite</span>
                )}
              </div>
            )}
            
            {obj.type === 'button' && (
              <div className="w-full h-full bg-green-500 rounded flex items-center justify-center text-white font-medium">
                {obj.properties.text || 'Botón'}
              </div>
            )}
            
            {obj.type === 'audio' && (
              <div className="w-full h-full bg-blue-500 rounded flex items-center justify-center text-white">
                <span className="text-xs">🎵</span>
              </div>
            )}
            
            {obj.type === 'background' && (
              <div className="w-full h-full">
                {obj.properties.imageUrl ? (
                  <img
                    src={obj.properties.imageUrl}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200" />
                )}
              </div>
            )}
          </div>
        ))}

        {/* Overlay de información */}
        {isPreviewMode && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            Vista Previa
          </div>
        )}
      </div>

      {/* Información de la escena */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Dimensiones:</span>
            <span className="ml-1 font-medium">{scene.width} × {scene.height}</span>
          </div>
          <div>
            <span className="text-gray-500">Objetos:</span>
            <span className="ml-1 font-medium">{scene.objects.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Visibles:</span>
            <span className="ml-1 font-medium">{scene.objects.filter(obj => obj.visible).length}</span>
          </div>
          <div>
            <span className="text-gray-500">Fondo:</span>
            <span className="ml-1 font-medium">{scene.backgroundColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePreview;
