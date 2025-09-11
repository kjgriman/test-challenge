import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Users, Volume2, VolumeX } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GameWord, gameWords } from './GameData';
import { GameState as WebSocketGameState } from './GameWebSocketManager';

interface PhaserWordGameProps {
  sessionId: string;
  onClose: () => void;
  onGameEnd?: (results: GameResults) => void;
  gameState?: WebSocketGameState;
  onAnswerSelected?: (answer: string) => void;
  onGameStart?: () => void;
  onGameEndCallback?: () => void;
}

interface GameResults {
  score: { slp: number; child: number };
  totalRounds: number;
  correctAnswers: { slp: number; child: number };
  winner: 'slp' | 'child' | 'tie';
}

interface LocalGameState {
  isPlaying: boolean;
  currentTurn: 'slp' | 'child';
  score: { slp: number; child: number };
  round: number;
  maxRounds: number;
  currentWord: GameWord | null;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  timeRemaining: number;
  isPaused: boolean;
}

class WordGameScene extends Phaser.Scene {
  private gameState!: WebSocketGameState;
  private gameContainer!: Phaser.GameObjects.Container;
  private wordText!: Phaser.GameObjects.Text;
  private imageSprite!: Phaser.GameObjects.Sprite;
  private optionsContainer!: Phaser.GameObjects.Container;
  private scoreText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isSoundEnabled = true;

  constructor() {
    super({ key: 'WordGameScene' });
  }

  preload() {
    // Cargar imágenes usando SVG más visuales
    this.load.image('dog', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTIwIiByeD0iNjAiIHJ5PSI0MCIgZmlsbD0iI2ZmOTkwMCIvPjxjaXJjbGUgY3g9Ijg1IiBjeT0iMTAwIiByPSI4IiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iMTE1IiBjeT0iMTAwIiByPSI4IiBmaWxsPSIjMzMzIi8+PGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEzMCIgcng9IjE1IiByeT0iMTAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Eb2c8L3RleHQ+PC9zdmc+');
    this.load.image('cat', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTIwIiByeD0iNjAiIHJ5PSI0MCIgZmlsbD0iIzk5OTlmZiIvPjxjaXJjbGUgY3g9Ijg1IiBjeT0iMTAwIiByPSI4IiBmaWxsPSIjMzMzIi8+PGNpcmNsZSBjeD0iMTE1IiBjeT0iMTAwIiByPSI4IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTgwIDEzMEw5MCAxNDBMMTAwIDEzMEwxMTAgMTQwTDEyMCAxMzAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2F0PC90ZXh0Pjwvc3ZnPg==');
    this.load.image('bird', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTEwIiByeD0iNDAiIHJ5PSIzMCIgZmlsbD0iI2ZmZmYwMCIvPjxjaXJjbGUgY3g9IjkwIiBjeT0iMTA1IiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTYwIDEwMEw4MCA5MEwxMjAgOTBMMTQwIDEwMCIgc3Ryb2tlPSIjZmZmZjAwIiBzdHJva2Utd2lkdGg9IjEwIiBmaWxsPSJub25lIi8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QmlyZDwvdGV4dD48L3N2Zz4=');
    this.load.image('house', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI2MCIgeT0iMTIwIiB3aWR0aD0iODAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZjY2NjYiLz48cG9seWdvbiBwb2ludHM9IjUwLDEyMCAxMDAsODAgMTUwLDEyMCIgZmlsbD0iI2ZmMDAwMCIvPjxyZWN0IHg9Ijc1IiB5PSIxNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjE0MCIgcj0iOCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjEwMCIgeT0iMTkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkhvdXNlPC90ZXh0Pjwvc3ZnPg==');
    this.load.image('tree', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI5NSIgeT0iMTQwIiB3aWR0aD0iMTAiIGhlaWdodD0iNjAiIGZpbGw9IiM4QjQ1MTMiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMjAiIHI9IjMwIiBmaWxsPSIjNjZmZjY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VHJlZTwvdGV4dD48L3N2Zz4=');
    this.load.image('sun', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjZmZmZjAwIi8+PGxpbmUgeDE9IjEwMCIgeTE9IjIwIiB4Mj0iMTAwIiB5Mj0iNDAiIHN0cm9rZT0iI2ZmZmYwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PGxpbmUgeDE9IjE4MCIgeTE9IjEwMCIgeDI9IjE2MCIgeTI9IjEwMCIgc3Ryb2tlPSIjZmZmZjAwIiBzdHJva2Utd2lkdGg9IjQiLz48bGluZSB4MT0iMTAwIiB5MT0iMTgwIiB4Mj0iMTAwIiB5Mj0iMTYwIiBzdHJva2U9IiNmZmZmMDAiIHN0cm9rZS13aWR0aD0iNCIvPjxsaW5lIHgxPSIyMCIgeTE9IjEwMCIgeDI9IjQwIiB5Mj0iMTAwIiBzdHJva2U9IiNmZmZmMDAiIHN0cm9rZS13aWR0aD0iNCIvPjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlN1bjwvdGV4dD48L3N2Zz4=');
    this.load.image('car', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI0MCIgeT0iMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiByeD0iMTAiIGZpbGw9IiM2NjY2ZmYiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjE2MCIgcj0iMTUiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSIxNjAiIHI9IjE1IiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iMTAwIiB5PSIxOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2FyPC90ZXh0Pjwvc3ZnPg==');
    this.load.image('book', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI3MCIgeT0iMTEwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIGZpbGw9IiNmZjk5ZmYiLz48bGluZSB4MT0iNzAiIHkxPSIxMzAiIHgyPSIxMzAiIHkyPSIxMzAiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Qm9vazwvdGV4dD48L3N2Zz4=');
    this.load.image('red', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBmaWxsPSIjZmY2NjY2Ii8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVkPC90ZXh0Pjwvc3ZnPg==');
    this.load.image('blue', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBmaWxsPSIjNjY2NmZmIi8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Qmx1ZTwvdGV4dD48L3N2Zz4=');
    this.load.image('one', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIxMDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgwIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4xPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk9uZTwvdGV4dD48L3N2Zz4=');
    this.load.image('two', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIxMDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgwIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4yPC90ZXh0Pjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlR3bzwvdGV4dD48L3N2Zz4=');
    this.load.image('happy', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBmaWxsPSIjZmZmZjAwIi8+PGNpcmNsZSBjeD0iOTAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjExMCIgY3k9IjkwIiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTgwIDEyMEwxMjAgMTIwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SGFwcHk8L3RleHQ+PC9zdmc+');
    this.load.image('sad', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjQwIiBmaWxsPSIjNjY2NmZmIi8+PGNpcmNsZSBjeD0iOTAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjExMCIgY3k9IjkwIiByPSI1IiBmaWxsPSIjMzMzIi8+PHBhdGggZD0iTTgwIDEyMEwxMjAgMTIwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2FkPC90ZXh0Pjwvc3ZnPg==');

    // Los sonidos se manejarán con efectos visuales por ahora
    // TODO: Agregar archivos de audio válidos más adelante
  }

  create() {
    // Crear fondo con gradiente
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB);

    // Crear contenedor principal
    this.gameContainer = this.add.container(400, 300);

    // Crear texto de la palabra
    this.wordText = this.add.text(0, -200, '', {
      fontSize: '48px',
      color: '#333',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // Crear sprite de imagen
    this.imageSprite = this.add.sprite(0, -50, 'dog').setScale(0.8);

    // Crear contenedor de opciones
    this.optionsContainer = this.add.container(0, 100);

    // Crear texto de puntuación
    this.scoreText = this.add.text(-300, -250, 'SLP: 0 | Niño: 0', {
      fontSize: '24px',
      color: '#333',
      fontFamily: 'Arial'
    });

    // Crear texto de turno
    this.turnText = this.add.text(0, -250, 'Turno: SLP', {
      fontSize: '24px',
      color: '#333',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Crear texto de temporizador
    this.timerText = this.add.text(300, -250, '30s', {
      fontSize: '24px',
      color: '#333',
      fontFamily: 'Arial'
    });

    // Crear texto de feedback
    this.feedbackText = this.add.text(0, 200, '', {
      fontSize: '32px',
      color: '#333',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // Agregar elementos al contenedor
    this.gameContainer.add([
      this.wordText,
      this.imageSprite,
      this.optionsContainer,
      this.scoreText,
      this.turnText,
      this.timerText,
      this.feedbackText
    ]);

    // Inicializar con un estado por defecto para mostrar opciones
    this.initializeDefaultGame();

    // Configurar eventos
    this.events.on('updateGameState', (newState: WebSocketGameState) => {
      console.log('🔄 Recibido updateGameState:', newState);
      this.gameState = newState;
      this.updateUI();
    });

    this.events.on('showFeedback', (isCorrect: boolean) => {
      this.showFeedback(isCorrect);
    });

    this.events.on('toggleSound', (enabled: boolean) => {
      this.isSoundEnabled = enabled;
    });
  }

  private initializeDefaultGame() {
    console.log('🎮 Inicializando juego por defecto');
    
    // Crear un estado inicial con una palabra
    this.gameState = {
      isPlaying: true,
      currentTurn: 'slp',
      score: { slp: 0, child: 0 },
      round: 1,
      maxRounds: 10,
      currentWord: {
        word: 'dog',
        image: 'dog',
        category: 'animals',
        difficulty: 'easy',
        alternatives: ['cat', 'bird', 'house']
      },
      selectedAnswer: null,
      isCorrect: null,
      timeRemaining: 30,
      isPaused: false,
      participants: []
    };

    console.log('🎮 Estado inicial creado:', this.gameState);
    this.updateUI();
  }

  private updateUI() {
    if (!this.gameState) return;

    // Actualizar texto de la palabra
    if (this.gameState.currentWord) {
      this.wordText.setText(this.gameState.currentWord.word);
      this.imageSprite.setTexture(this.gameState.currentWord.word.toLowerCase());
    }

    // Actualizar puntuación
    this.scoreText.setText(`SLP: ${this.gameState.score.slp} | Niño: ${this.gameState.score.child}`);

    // Actualizar turno
    this.turnText.setText(`Turno: ${this.gameState.currentTurn === 'slp' ? 'SLP' : 'Niño'}`);

    // Actualizar temporizador
    this.timerText.setText(`${this.gameState.timeRemaining}s`);

    // Actualizar opciones
    this.updateOptions();
  }

  private updateOptions() {
    console.log('🔍 updateOptions llamado');
    console.log('🔍 gameState:', this.gameState);
    console.log('🔍 currentWord:', this.gameState?.currentWord);
    
    if (!this.gameState?.currentWord) {
      console.log('❌ No hay currentWord, no se pueden mostrar opciones');
      return;
    }

    // Limpiar opciones anteriores
    this.optionsContainer.removeAll(true);

    // Generar opciones
    const options = this.generateOptions(this.gameState.currentWord);
    console.log('🔍 Opciones generadas:', options);

    // Crear botones de opciones con imágenes
    options.forEach((option, index) => {
      const x = (index - 1) * 200;
      const y = 0;

      console.log(`🔍 Creando opción ${index}: ${option} en posición (${x}, ${y})`);

      // Crear fondo del botón
      const button = this.add.rectangle(x, y, 150, 120, 0xffffff, 0.8)
        .setStrokeStyle(3, 0x4CAF50)
        .setInteractive();

      // Crear imagen de la opción
      const optionImage = this.add.image(x, y - 20, option.toLowerCase())
        .setDisplaySize(80, 80)
        .setInteractive();

      // Crear texto de la opción
      const buttonText = this.add.text(x, y + 40, option, {
        fontSize: '16px',
        color: '#333',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // Hacer que tanto el botón como la imagen sean clickeables
      const clickHandler = () => {
        this.selectAnswer(option);
      };

      button.on('pointerdown', clickHandler);
      optionImage.on('pointerdown', clickHandler);

      // Efecto hover
      button.on('pointerover', () => {
        button.setFillStyle(0x4CAF50, 0.3);
      });

      button.on('pointerout', () => {
        button.setFillStyle(0xffffff, 0.8);
      });

      this.optionsContainer.add([button, optionImage, buttonText]);
    });
    
    console.log('✅ Opciones creadas exitosamente');
  }

  private generateOptions(correctWord: GameWord): string[] {
    const options = [correctWord.word];
    options.push(...correctWord.alternatives.slice(0, 2));
    
    // Agregar opciones aleatorias si es necesario
    while (options.length < 3) {
      const randomWord = gameWords[Math.floor(Math.random() * gameWords.length)];
      if (!options.includes(randomWord.word)) {
        options.push(randomWord.word);
      }
    }

    return options.sort(() => Math.random() - 0.5);
  }

  private selectAnswer(answer: string) {
    console.log('🖱️ selectAnswer llamado con:', answer);
    console.log('🖱️ gameState:', this.gameState);
    console.log('🖱️ currentWord:', this.gameState?.currentWord);
    
    if (!this.gameState?.currentWord) {
      console.log('❌ No hay currentWord en selectAnswer');
      return;
    }

    const isCorrect = answer === this.gameState.currentWord.word;
    console.log('🖱️ Respuesta correcta:', isCorrect);
    
    this.showFeedback(isCorrect);

    // Emitir evento de respuesta
    this.events.emit('answerSelected', {
      answer,
      isCorrect,
      word: this.gameState.currentWord.word
    });
    
    console.log('✅ Evento answerSelected emitido');
  }

  private showFeedback(isCorrect: boolean) {
    console.log('💬 showFeedback llamado con:', isCorrect);
    
    this.feedbackText.setText(isCorrect ? '¡Correcto!' : 'Incorrecto')
      .setTint(isCorrect ? 0x00ff00 : 0xff0000);

    // Mostrar partículas si es correcto
    if (isCorrect) {
      this.showParticles();
    }

    // Ocultar feedback después de 2 segundos
    this.time.delayedCall(2000, () => {
      this.feedbackText.setText('');
    });
  }

  private showParticles() {
    if (this.particles) {
      this.particles.destroy();
    }

    this.particles = this.add.particles(0, 0, 'dog', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 1000,
      quantity: 20
    });

    this.gameContainer.add(this.particles);
  }
}

const PhaserWordGame: React.FC<PhaserWordGameProps> = ({
  sessionId,
  onClose,
  onGameEnd,
  gameState: externalGameState,
  onAnswerSelected,
  onGameStart,
  onGameEndCallback
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { user } = useAuthStore();

  const [localGameState, setLocalGameState] = useState<LocalGameState>({
    isPlaying: false,
    currentTurn: 'slp',
    score: { slp: 0, child: 0 },
    round: 1,
    maxRounds: 10,
    currentWord: null,
    selectedAnswer: null,
    isCorrect: null,
    timeRemaining: 30,
    isPaused: false
  });

  // Usar estado externo si está disponible, sino usar estado local
  const gameState = externalGameState || localGameState;

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#87CEEB',
      scene: WordGameScene,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      }
    };

    phaserGameRef.current = new Phaser.Game(config);
    
    // Configurar eventos del juego después de que la escena esté lista
    const setupEvents = () => {
      const scene = phaserGameRef.current?.scene.getScene('WordGameScene') as WordGameScene;
      if (scene && scene.events) {
        scene.events.on('answerSelected', (data: { answer: string; isCorrect: boolean; word: string }) => {
          if (onAnswerSelected) {
            onAnswerSelected(data.answer);
          }
        });
      } else {
        // Reintentar después de un breve delay
        setTimeout(setupEvents, 100);
      }
    };
    
    setupEvents();

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!phaserGameRef.current) return;

    const scene = phaserGameRef.current.scene.getScene('WordGameScene') as WordGameScene;
    if (scene && scene.events) {
      scene.events.emit('updateGameState', gameState);
    }
  }, [gameState]);

  const handleStartGame = () => {
    setLocalGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentWord: gameWords[0],
      timeRemaining: 30
    }));

    if (onGameStart) {
      onGameStart();
    }
  };

  const handlePauseGame = () => {
    setLocalGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const handleResetGame = () => {
    setLocalGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentTurn: 'slp',
      score: { slp: 0, child: 0 },
      round: 1,
      currentWord: null,
      selectedAnswer: null,
      isCorrect: null,
      timeRemaining: 30,
      isPaused: false
    }));
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene('WordGameScene') as WordGameScene;
      if (scene && scene.events) {
        scene.events.emit('toggleSound', !isSoundEnabled);
      }
    }
  };

  const handleCloseGame = () => {
    if (onGameEndCallback) {
      onGameEndCallback();
      return;
    }

    const winner = gameState.score.slp > gameState.score.child ? 'slp' : 
                  gameState.score.child > gameState.score.slp ? 'child' : 'tie';
    
    const results: GameResults = {
      score: gameState.score,
      totalRounds: gameState.round,
      correctAnswers: {
        slp: Math.floor(gameState.score.slp / 10),
        child: Math.floor(gameState.score.child / 10)
      },
      winner
    };

    if (onGameEnd) {
      onGameEnd(results);
    }

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white rounded-lg p-6 w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Juego de Palabras - Sesión {sessionId}
          </h2>
          <button
            onClick={handleCloseGame}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Game Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleStartGame}
            disabled={gameState.isPlaying}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            <Play size={16} />
            Iniciar
          </button>
          
          <button
            onClick={handlePauseGame}
            disabled={!gameState.isPlaying}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
          >
            {gameState.isPaused ? <Play size={16} /> : <Pause size={16} />}
            {gameState.isPaused ? 'Reanudar' : 'Pausar'}
          </button>
          
          <button
            onClick={handleResetGame}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <RotateCcw size={16} />
            Reiniciar
          </button>
          
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Sonido
          </button>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
            <div ref={gameRef} className="w-full h-full" />
          </div>
        </div>

        {/* Game Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instrucciones:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Selecciona la imagen correcta</li>
            <li>• Tienes 30 segundos por turno</li>
            <li>• Alterna turnos entre SLP y Niño</li>
            <li>• Gana quien tenga más puntos al final</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhaserWordGame;