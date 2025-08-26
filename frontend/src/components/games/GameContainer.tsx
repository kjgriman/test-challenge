import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Users, Trophy, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import GameScore from './GameScore';
import GameTimer from './GameTimer';
import { GameManager, gameWords } from './GameData';

interface GameContainerProps {
  sessionId: string;
  onClose: () => void;
}

interface GameData {
  currentWord: string;
  currentImage: string;
  options: string[];
  correctAnswer: string;
}

const GameContainer: React.FC<GameContainerProps> = ({ sessionId, onClose }) => {
  const [gameState, setGameState] = useState({
    isPlaying: false,
    currentTurn: 'slp' as 'slp' | 'child',
    score: { slp: 0, child: 0 },
    round: 1,
    maxRounds: 10,
    gameData: {
      currentWord: '',
      currentImage: '',
      options: [],
      correctAnswer: ''
    } as GameData
  });

  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const gameManagerRef = useRef<GameManager>(new GameManager(gameWords));

  // Función para sincronizar el estado del juego
  const syncGameState = () => {
    const gameManager = gameManagerRef.current;
    const managerState = gameManager.getGameState();
    
    setGameState(prev => ({
      ...prev,
      currentTurn: managerState.currentTurn,
      score: managerState.score,
      round: managerState.currentRound,
      maxRounds: managerState.maxRounds
    }));
  };

  // Inicializar juego
  const startGame = () => {
    const gameManager = gameManagerRef.current;
    gameManager.resetGame();
    
    const roundData = gameManager.generateRoundData();
    const managerState = gameManager.getGameState();
    
    setGameState({
      isPlaying: true,
      currentTurn: managerState.currentTurn,
      score: managerState.score,
      round: managerState.currentRound,
      maxRounds: managerState.maxRounds,
      gameData: {
        currentWord: roundData.word,
        currentImage: roundData.image,
        options: roundData.options,
        correctAnswer: roundData.correctAnswer
      }
    });
    
    setIsPaused(false);
    setTimeRemaining(60);
    setSelectedAnswer(null);
  };

  // Manejar respuesta
  const handleAnswer = (answer: string) => {
    if (gameState.currentTurn !== user?.role) return;
    
    setSelectedAnswer(answer);
    
    const gameManager = gameManagerRef.current;
    const result = gameManager.processAnswer(
      answer, 
      gameState.gameData.correctAnswer, 
      user?.role as 'slp' | 'child'
    );

    // Mostrar resultado por 2 segundos
    setTimeout(() => {
      if (result.isCorrect) {
        // Avanzar ronda
        const hasMoreRounds = gameManager.nextRound();
        if (hasMoreRounds) {
          const newRoundData = gameManager.generateRoundData();
          const managerState = gameManager.getGameState();
          
          setGameState(prev => ({
            ...prev,
            currentTurn: managerState.currentTurn,
            score: managerState.score,
            round: managerState.currentRound,
            gameData: {
              currentWord: newRoundData.word,
              currentImage: newRoundData.image,
              options: newRoundData.options,
              correctAnswer: newRoundData.correctAnswer
            }
          }));
        } else {
          // Juego terminado
          const managerState = gameManager.getGameState();
          setGameState(prev => ({
            ...prev,
            isPlaying: false,
            score: managerState.score,
            round: managerState.currentRound
          }));
        }
      } else {
        // Cambiar turno
        const newTurn = gameManager.changeTurn();
        const managerState = gameManager.getGameState();
        
        setGameState(prev => ({
          ...prev,
          currentTurn: managerState.currentTurn,
          score: managerState.score
        }));
      }
      
      setSelectedAnswer(null);
    }, 2000);
  };

  // Manejar tiempo agotado
  const handleTimeUp = () => {
    const gameManager = gameManagerRef.current;
    const newTurn = gameManager.changeTurn();
    const managerState = gameManager.getGameState();
    
    setGameState(prev => ({
      ...prev,
      currentTurn: managerState.currentTurn
    }));
    setTimeRemaining(60);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header del juego */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">🎮 Juego de Palabras</h2>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Sesión: {sessionId}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <GameTimer 
                timeRemaining={timeRemaining} 
                isActive={gameState.isPlaying && !isPaused}
                onTimeUp={handleTimeUp}
              />
              <GameScore score={gameState.score} />
              <button
                onClick={onClose}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>

        {/* Controles del juego */}
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                Ronda: {gameState.round}/{gameState.maxRounds}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                gameState.currentTurn === 'slp' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                Turno: {gameState.currentTurn === 'slp' ? 'Terapeuta' : 'Niño'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {!gameState.isPlaying ? (
                <button
                  onClick={startGame}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Iniciar Juego</span>
                </button>
              ) : (
                <>
                  {isPaused ? (
                    <button
                      onClick={() => setIsPaused(false)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Reanudar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsPaused(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </button>
                  )}
                  
                  <button
                    onClick={startGame}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reiniciar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Área del juego */}
        <div className="flex-1 p-4 bg-gray-50">
          <div className="h-full flex">
            {/* Canvas del juego */}
            <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden p-8">
              {gameState.isPlaying ? (
                <div className="h-full flex flex-col items-center justify-center">
                  {/* Palabra actual */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">Palabra a encontrar:</h3>
                    <div className="text-6xl font-bold text-blue-600 bg-blue-50 px-8 py-4 rounded-lg">
                      {gameState.gameData.currentWord}
                    </div>
                  </div>

                  {/* Opciones */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {gameState.gameData.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={gameState.currentTurn !== user?.role || selectedAnswer !== null}
                        className={`p-4 rounded-lg border-2 text-lg font-medium transition-all ${
                          selectedAnswer === option
                            ? option === gameState.gameData.correctAnswer
                              ? 'bg-green-500 text-white border-green-600'
                              : 'bg-red-500 text-white border-red-600'
                            : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                        } ${
                          gameState.currentTurn !== user?.role || selectedAnswer !== null
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {/* Mensaje de turno */}
                  <div className="mt-6 text-center">
                    {gameState.currentTurn === user?.role ? (
                      <p className="text-green-600 font-medium">¡Es tu turno! Selecciona la respuesta correcta.</p>
                    ) : (
                      <p className="text-gray-600">Esperando al otro jugador...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">Juego de Palabras</h3>
                    <p className="text-gray-600 mb-6">
                      Empareja las palabras con las imágenes correctas. Los turnos alternan entre participantes.
                    </p>
                    <button
                      onClick={startGame}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-medium"
                    >
                      Iniciar Juego
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Panel lateral */}
            <div className="w-80 ml-4 space-y-4">
              {/* Estado del juego */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Estado del Juego</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={`font-medium ${
                      gameState.isPlaying ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {gameState.isPlaying ? 'Jugando' : 'Esperando'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turno actual:</span>
                    <span className="font-medium">
                      {gameState.currentTurn === 'slp' ? 'Terapeuta' : 'Niño'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ronda:</span>
                    <span className="font-medium">{gameState.round}/{gameState.maxRounds}</span>
                  </div>
                </div>
              </div>

              {/* Palabra actual */}
              {gameState.isPlaying && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Palabra Actual</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {gameState.gameData.currentWord}
                    </div>
                    <div className="text-sm text-gray-600">
                      Selecciona la imagen correcta
                    </div>
                  </div>
                </div>
              )}

              {/* Instrucciones */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-800">Instrucciones</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• El terapeuta inicia el juego</li>
                  <li>• Se muestran palabras e imágenes</li>
                  <li>• Selecciona la imagen correcta</li>
                  <li>• Los turnos alternan entre participantes</li>
                  <li>• Gana quien tenga más puntos al final</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameContainer;
