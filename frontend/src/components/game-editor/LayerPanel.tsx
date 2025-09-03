import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Image,
  Type,
  Target,
  Music,
  Square
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

interface LayerPanelProps {
  objects: GameObject[];
  selectedObject: GameObject | null;
  onSelectObject: (object: GameObject | null) => void;
  onDeleteObject: (objectId: string) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  objects,
  selectedObject,
  onSelectObject,
  onDeleteObject
}) => {
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

  const getObjectName = (obj: GameObject) => {
    if (obj.type === 'text' && obj.properties.text) {
      return obj.properties.text.length > 20 
        ? obj.properties.text.substring(0, 20) + '...' 
        : obj.properties.text;
    }
    return `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} ${obj.id.split('-')[1]}`;
  };

  const toggleObjectVisibility = (obj: GameObject) => {
    const updatedObject = {
      ...obj,
      visible: !obj.visible
    };
    // Aquí deberías llamar a una función para actualizar el objeto
    console.log('Toggle visibility:', updatedObject);
  };

  const duplicateObject = (obj: GameObject) => {
    const duplicatedObject = {
      ...obj,
      id: `${obj.type}-${Date.now()}`,
      x: obj.x + 20,
      y: obj.y + 20
    };
    // Aquí deberías llamar a una función para agregar el objeto duplicado
    console.log('Duplicate object:', duplicatedObject);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Capas ({objects.length})
        </h3>
      </div>

      {objects.length === 0 ? (
        <div className="text-center py-8">
          <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay objetos en la escena</p>
        </div>
      ) : (
        <div className="space-y-2">
          {objects.map((obj, index) => (
            <motion.div
              key={obj.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedObject?.id === obj.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectObject(obj)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 w-4 text-center">
                      {objects.length - index}
                    </span>
                    {getObjectIcon(obj.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getObjectName(obj)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(obj.x)}, {Math.round(obj.y)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleObjectVisibility(obj);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 ${
                      obj.visible ? 'text-gray-700' : 'text-gray-400'
                    }`}
                    title={obj.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {obj.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateObject(obj);
                    }}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600"
                    title="Duplicar"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(obj.id);
                    }}
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Información adicional del objeto */}
              {selectedObject?.id === obj.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <span className="ml-1 font-medium">{obj.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tamaño:</span>
                      <span className="ml-1 font-medium">
                        {obj.width || 100} × {obj.height || 100}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rotación:</span>
                      <span className="ml-1 font-medium">{Math.round(obj.rotation)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Escala:</span>
                      <span className="ml-1 font-medium">
                        {obj.scale.x.toFixed(1)} × {obj.scale.y.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Controles de capas */}
      {objects.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Orden de capas</span>
            <div className="flex items-center space-x-1">
              <button
                className="p-1 rounded hover:bg-gray-200"
                title="Mover hacia arriba"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200"
                title="Mover hacia abajo"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerPanel;
