import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Phaser from 'phaser';

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

interface GameEditorProps {
  scene: GameScene | null;
  selectedObject: GameObject | null;
  isPreviewMode: boolean;
  onUpdateScene: (scene: GameScene) => void;
  onSelectObject: (object: GameObject | null) => void;
}

class EditorScene extends Phaser.Scene {
  private objects: GameObject[] = [];
  private selectedObject: GameObject | null = null;
  private onSelectObject: (object: GameObject | null) => void;
  private onUpdateScene: (scene: GameScene) => void;
  private gameObjects: Map<string, Phaser.GameObjects.GameObject> = new Map();
  private isPreviewMode: boolean = false;

  constructor(
    onSelectObject: (object: GameObject | null) => void,
    onUpdateScene: (scene: GameScene) => void
  ) {
    super({ key: 'EditorScene' });
    this.onSelectObject = onSelectObject;
    this.onUpdateScene = onUpdateScene;
  }

  create() {
    // Configurar fondo
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Configurar input
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    
    // Configurar teclado
    this.input.keyboard?.on('keydown-DELETE', this.handleDelete, this);
    this.input.keyboard?.on('keydown-BACKSPACE', this.handleDelete, this);
  }

  updateScene(scene: GameScene, isPreviewMode: boolean) {
    this.isPreviewMode = isPreviewMode;
    this.objects = scene.objects;
    this.clearScene();
    this.renderObjects();
  }

  private clearScene() {
    this.gameObjects.forEach(obj => obj.destroy());
    this.gameObjects.clear();
  }

  private renderObjects() {
    this.objects.forEach(obj => {
      let gameObject: Phaser.GameObjects.GameObject;

      switch (obj.type) {
        case 'sprite':
        case 'background':
          gameObject = this.add.sprite(obj.x, obj.y, 'placeholder');
          if (obj.properties.imageUrl) {
            // Cargar imagen si existe
            this.load.image(obj.id, obj.properties.imageUrl);
          }
          break;

        case 'text':
          gameObject = this.add.text(obj.x, obj.y, obj.properties.text || 'Texto', {
            fontSize: obj.properties.fontSize || '24px',
            color: obj.properties.color || '#000000',
            fontFamily: obj.properties.fontFamily || 'Arial'
          });
          break;

        case 'button':
          gameObject = this.add.rectangle(obj.x, obj.y, obj.width || 100, obj.height || 50, 0x4CAF50);
          const text = this.add.text(obj.x, obj.y, obj.properties.text || 'Botón', {
            fontSize: '16px',
            color: '#FFFFFF'
          });
          text.setOrigin(0.5);
          break;

        default:
          gameObject = this.add.rectangle(obj.x, obj.y, obj.width || 100, obj.height || 100, 0xCCCCCC);
      }

      // Configurar propiedades comunes
      gameObject.setRotation(obj.rotation);
      gameObject.setScale(obj.scale.x, obj.scale.y);
      gameObject.setVisible(obj.visible);

      // Hacer interactivo si no está en modo preview
      if (!this.isPreviewMode) {
        gameObject.setInteractive();
        gameObject.on('pointerdown', () => this.selectObject(obj));
      }

      this.gameObjects.set(obj.id, gameObject);
    });
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.isPreviewMode) return;

    // Verificar si se hizo clic en un objeto
    const hitObject = this.input.hitTest(pointer.x, pointer.y);
    if (hitObject.length > 0) {
      const gameObject = hitObject[0];
      const obj = this.objects.find(o => this.gameObjects.get(o.id) === gameObject);
      if (obj) {
        this.selectObject(obj);
      }
    } else {
      this.selectObject(null);
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (this.isPreviewMode || !this.selectedObject) return;

    // Mover objeto seleccionado
    if (pointer.isDown) {
      this.selectedObject.x = pointer.x;
      this.selectedObject.y = pointer.y;
      this.updateObjectPosition(this.selectedObject);
    }
  }

  private handlePointerUp() {
    // Finalizar movimiento
  }

  private handleDelete() {
    if (this.selectedObject) {
      this.deleteObject(this.selectedObject.id);
    }
  }

  private selectObject(obj: GameObject | null) {
    this.selectedObject = obj;
    this.onSelectObject(obj);
    
    // Actualizar visualización de selección
    this.gameObjects.forEach((gameObject, id) => {
      if (obj && id === obj.id) {
        // Resaltar objeto seleccionado
        if (gameObject instanceof Phaser.GameObjects.Rectangle) {
          gameObject.setStrokeStyle(2, 0x00FF00);
        }
      } else {
        // Quitar resaltado
        if (gameObject instanceof Phaser.GameObjects.Rectangle) {
          gameObject.setStrokeStyle(0);
        }
      }
    });
  }

  private updateObjectPosition(obj: GameObject) {
    const gameObject = this.gameObjects.get(obj.id);
    if (gameObject) {
      gameObject.setPosition(obj.x, obj.y);
      this.onUpdateScene({
        ...this.scene,
        objects: this.objects
      });
    }
  }

  private deleteObject(objectId: string) {
    const gameObject = this.gameObjects.get(objectId);
    if (gameObject) {
      gameObject.destroy();
      this.gameObjects.delete(objectId);
    }

    this.objects = this.objects.filter(obj => obj.id !== objectId);
    this.onUpdateScene({
      ...this.scene,
      objects: this.objects
    });

    if (this.selectedObject?.id === objectId) {
      this.selectObject(null);
    }
  }
}

const GameEditor: React.FC<GameEditorProps> = ({
  scene,
  selectedObject,
  isPreviewMode,
  onUpdateScene,
  onSelectObject
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);

  useEffect(() => {
    if (!gameRef.current || gameInstanceRef.current) return;

    // Crear instancia de Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: scene?.backgroundColor || '#87CEEB',
      scene: EditorScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    // Esperar a que el juego esté listo
    game.events.once('ready', () => {
      setIsGameReady(true);
    });

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isGameReady || !scene || !gameInstanceRef.current) return;

    const editorScene = gameInstanceRef.current.scene.getScene('EditorScene') as EditorScene;
    if (editorScene) {
      editorScene.updateScene(scene, isPreviewMode);
    }
  }, [scene, isPreviewMode, isGameReady]);

  if (!scene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecciona un Template
          </h3>
          <p className="text-gray-600">
            Elige un template para comenzar a crear tu juego
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header del editor */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Escena: {scene.name}
            </span>
            <span className="text-sm text-gray-500">
              {scene.width} x {scene.height}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isPreviewMode 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isPreviewMode ? 'Vista Previa' : 'Modo Edición'}
            </span>
          </div>
        </div>
      </div>

      {/* Área del juego */}
      <div className="flex-1 relative">
        <div 
          ref={gameRef} 
          className="w-full h-full"
        />
        
        {/* Overlay de información */}
        {selectedObject && !isPreviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
          >
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-1">
                {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)}
              </div>
              <div className="text-gray-600">
                X: {Math.round(selectedObject.x)}, Y: {Math.round(selectedObject.y)}
              </div>
              {selectedObject.properties.text && (
                <div className="text-gray-600">
                  Texto: {selectedObject.properties.text}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Controles de zoom */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <button className="w-8 h-8 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <span className="text-lg">+</span>
          </button>
          <button className="w-8 h-8 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <span className="text-lg">−</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEditor;
