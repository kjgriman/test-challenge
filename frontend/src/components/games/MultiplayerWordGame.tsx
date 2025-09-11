import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Users, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import PhaserWordGame from './PhaserWordGame';
import GameWebSocketManager, { GameState, GameResults, GameParticipant } from './GameWebSocketManager';

interface MultiplayerWordGameProps {
  sessionId: string;
  onClose: () => void;
  onGameEnd?: (results: any) => void;
}

const MultiplayerWordGame: React.FC<MultiplayerWordGameProps> = ({ sessionId, onClose, onGameEnd }) => {
  const { user, token } = useAuthStore();
  const wsManagerRef = useRef<GameWebSocketManager | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentTurn: 'slp',
    score: { slp: 0, child: 0 },
    round: 1,
    maxRounds: 10,
    currentWord: null,
    selectedAnswer: null,
    isCorrect: null,
    timeRemaining: 30,
    isPaused: false,
    participants: []
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  // Inicializar WebSocket Manager
  useEffect(() => {
    if (user && token) {
      wsManagerRef.current = new GameWebSocketManager(
        sessionId,
        user.id,
        user.role as 'slp' | 'child'
      );

      // Configurar event handlers
      wsManagerRef.current.on('gameStateUpdate', (newState: GameState) => {
        setGameState(newState);
      });

      wsManagerRef.current.on('gameStart', (data: any) => {
        console.log('🎮 Juego iniciado:', data);
      });

      wsManagerRef.current.on('gameEnd', (results: any) => {
        console.log('🏁 Juego terminado:', results);
        setGameResults(results);
        setShowResults(true);
        onGameEnd?.(results);
      });

      wsManagerRef.current.on('roundStart', (data: any) => {
        console.log('🔄 Nueva ronda:', data);
      });

      wsManagerRef.current.on('answerSelected', (data: any) => {
        console.log('✅ Respuesta seleccionada:', data);
      });

      wsManagerRef.current.on('turnChange', (data: any) => {
        console.log('🔄 Turno cambiado:', data);
      });

      wsManagerRef.current.on('timeUp', () => {
        console.log('⏰ Tiempo agotado');
      });

      wsManagerRef.current.on('participantJoined', (participant: GameParticipant) => {
        console.log('👤 Participante se unió:', participant);
      });

      wsManagerRef.current.on('participantLeft', (userId: string) => {
        console.log('👤 Participante se fue:', userId);
      });

      wsManagerRef.current.on('gameError', (error: string) => {
        console.error('❌ Error en el juego:', error);
        setError(error);
      });

      wsManagerRef.current.on('disconnected', () => {
        setIsConnected(false);
      });

      // Conectar
      connectToGame();
    }

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [user, token, sessionId]);

  const connectToGame = async () => {
    if (!wsManagerRef.current) {
      console.log('❌ No hay WebSocket manager');
      return;
    }

    // Obtener token del store o del localStorage como fallback
    const authToken = token || localStorage.getItem('auth_token');
    
    if (!authToken) {
      console.log('❌ No hay token disponible');
      setError('No hay token de autenticación disponible');
      return;
    }

    // Verificar que el token no esté expirado
    try {
      const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
      const now = Date.now() / 1000;
      if (tokenPayload.exp < now) {
        console.log('❌ Token expirado');
        setError('Token de autenticación expirado. Por favor, inicia sesión nuevamente.');
        return;
      }
      console.log('✅ Token válido, expira en:', new Date(tokenPayload.exp * 1000));
    } catch (error) {
      console.log('❌ Token inválido:', error);
      setError('Token de autenticación inválido. Por favor, inicia sesión nuevamente.');
      return;
    }

    console.log('🔑 Token para WebSocket:', authToken.substring(0, 20) + '...');

    setIsConnecting(true);
    setError(null);

    try {
      await wsManagerRef.current.connect(authToken);
      setIsConnected(true);
      console.log('✅ Conectado al juego multiplayer');
    } catch (error) {
      console.error('❌ Error conectando al juego:', error);
      setError('Error conectando al servidor de juegos');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const startGame = () => {
    if (wsManagerRef.current && isConnected) {
      wsManagerRef.current.startGame();
    }
  };

  const selectAnswer = (answer: string) => {
    if (wsManagerRef.current && isConnected) {
      wsManagerRef.current.selectAnswer(answer);
    }
  };

  const pauseGame = () => {
    if (wsManagerRef.current && isConnected) {
      wsManagerRef.current.pauseGame();
    }
  };

  const resumeGame = () => {
    if (wsManagerRef.current && isConnected) {
      wsManagerRef.current.resumeGame();
    }
  };

  const endGame = () => {
    if (wsManagerRef.current && isConnected) {
      wsManagerRef.current.endGame();
    }
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      currentTurn: 'slp',
      score: { slp: 0, child: 0 },
      round: 1,
      maxRounds: 10,
      currentWord: null,
      selectedAnswer: null,
      isCorrect: null,
      timeRemaining: 30,
      isPaused: false,
      participants: []
    });
    setShowResults(false);
    setGameResults(null);
  };

  const closeResults = () => {
    setShowResults(false);
    setGameResults(null);
  };

  if (showResults && gameResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={closeResults}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🏆 Resultados del Juego</h2>
            
            {/* Winner */}
            <div className="mb-6">
              <div className="text-2xl font-semibold text-gray-700 mb-2">
                {gameResults.winner === 'tie' ? '🤝 ¡Empate!' : 
                 gameResults.winner === 'slp' ? '🎓 ¡Ganó el Terapeuta!' : 
                 '👶 ¡Ganó el Niño!'}
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-green-800">Terapeuta</div>
                <div className="text-3xl font-bold text-green-600">{gameResults.score.slp}</div>
                <div className="text-sm text-green-700">
                  {gameResults.correctAnswers.slp} respuestas correctas
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-lg font-semibold text-blue-800">Niño</div>
                <div className="text-3xl font-bold text-blue-600">{gameResults.score.child}</div>
                <div className="text-sm text-blue-700">
                  {gameResults.correctAnswers.child} respuestas correctas
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rondas jugadas:</span>
                  <span className="font-semibold ml-2">{gameResults.totalRounds}</span>
                </div>
                <div>
                  <span className="text-gray-600">Duración:</span>
                  <span className="font-semibold ml-2">{Math.round(gameResults.duration / 1000)}s</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🎮 Jugar de Nuevo
              </button>
              <button
                onClick={closeResults}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">🎮 Juego Multiplayer de Palabras</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {isConnecting ? 'Conectando...' : 
                 isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={pauseGame}
              disabled={!gameState.isPlaying || gameState.isPaused}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Pausar"
            >
              <Pause size={20} />
            </button>
            <button
              onClick={resumeGame}
              disabled={!gameState.isPlaying || !gameState.isPaused}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Reanudar"
            >
              <Play size={20} />
            </button>
            <button
              onClick={resetGame}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Reiniciar"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Connection Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={connectToGame}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Reintentar conexión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Game Area */}
          <div className="flex-1 p-4">
            {isConnected ? (
              <PhaserWordGame
                sessionId={sessionId}
                onClose={onClose}
                onGameEnd={onGameEnd}
                gameState={gameState}
                onAnswerSelected={selectAnswer}
                onGameStart={startGame}
                onGameEndCallback={endGame}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">
                    {isConnecting ? 'Conectando al juego...' : 'Conectando al servidor'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isConnecting ? 'Espera mientras establecemos la conexión' : 
                     'Haz clic en "Reintentar" para conectarte'}
                  </p>
                  {!isConnecting && (
                    <button
                      onClick={connectToGame}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      🔄 Reintentar Conexión
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Game Info Panel */}
          <div className="w-80 p-4 space-y-4 bg-gray-50">
            {/* Connection Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Estado de Conexión</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Servidor:</span>
                  <span className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participantes:</span>
                  <span className="font-semibold">{gameState.participants.length}</span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Participantes</h3>
              <div className="space-y-2">
                {gameState.participants.length > 0 ? (
                  gameState.participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${participant.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-sm">{participant.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${participant.role === 'slp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {participant.role === 'slp' ? 'Terapeuta' : 'Niño'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">{participant.score}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Esperando participantes...</p>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Estado del Juego</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-semibold ${gameState.isPlaying ? 'text-green-600' : 'text-gray-600'}`}>
                    {gameState.isPlaying ? 'Jugando' : 'Detenido'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ronda:</span>
                  <span className="font-semibold">{gameState.round}/{gameState.maxRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Turno:</span>
                  <span className={`font-semibold ${gameState.currentTurn === 'slp' ? 'text-green-600' : 'text-blue-600'}`}>
                    {gameState.currentTurn === 'slp' ? 'Terapeuta' : 'Niño'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiempo:</span>
                  <span className="font-semibold text-red-600">{Math.ceil(gameState.timeRemaining)}s</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Puntuación</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Terapeuta:</span>
                  <span className="font-semibold text-green-600">{gameState.score.slp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Niño:</span>
                  <span className="font-semibold text-blue-600">{gameState.score.child}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Instrucciones</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Conecta con otros participantes</li>
                <li>• Los turnos alternan automáticamente</li>
                <li>• Selecciona la imagen correcta</li>
                <li>• Tienes 30 segundos por turno</li>
                <li>• ¡Diviértete aprendiendo juntos!</li>
              </ul>
            </div>

            {/* Start Button */}
            {!gameState.isPlaying && isConnected && (
              <button
                onClick={startGame}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors"
              >
                🎮 Iniciar Juego Multiplayer
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiplayerWordGame;
