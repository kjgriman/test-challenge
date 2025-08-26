// Datos del juego para terapia del habla (versión backend)
export interface GameWord {
  word: string;
  image: string;
  category: 'animals' | 'objects' | 'colors' | 'numbers' | 'emotions';
  difficulty: 'easy' | 'medium' | 'hard';
  alternatives: string[];
}

export const gameWords: GameWord[] = [
  // Animales (fáciles)
  {
    word: 'perro',
    image: '/images/animals/dog.png',
    category: 'animals',
    difficulty: 'easy',
    alternatives: ['gato', 'pájaro', 'pez']
  },
  {
    word: 'gato',
    image: '/images/animals/cat.png',
    category: 'animals',
    difficulty: 'easy',
    alternatives: ['perro', 'conejo', 'ratón']
  },
  {
    word: 'pájaro',
    image: '/images/animals/bird.png',
    category: 'animals',
    difficulty: 'easy',
    alternatives: ['mariposa', 'abeja', 'mosca']
  },
  {
    word: 'casa',
    image: '/images/objects/house.png',
    category: 'objects',
    difficulty: 'easy',
    alternatives: ['edificio', 'castillo', 'cabaña']
  },
  {
    word: 'árbol',
    image: '/images/objects/tree.png',
    category: 'objects',
    difficulty: 'easy',
    alternatives: ['flor', 'planta', 'bosque']
  },
  {
    word: 'sol',
    image: '/images/objects/sun.png',
    category: 'objects',
    difficulty: 'easy',
    alternatives: ['luna', 'estrella', 'nube']
  },
  {
    word: 'coche',
    image: '/images/objects/car.png',
    category: 'objects',
    difficulty: 'easy',
    alternatives: ['camión', 'moto', 'bicicleta']
  },
  {
    word: 'libro',
    image: '/images/objects/book.png',
    category: 'objects',
    difficulty: 'easy',
    alternatives: ['revista', 'periódico', 'cuaderno']
  },
  {
    word: 'rojo',
    image: '/images/colors/red.png',
    category: 'colors',
    difficulty: 'easy',
    alternatives: ['azul', 'verde', 'amarillo']
  },
  {
    word: 'azul',
    image: '/images/colors/blue.png',
    category: 'colors',
    difficulty: 'easy',
    alternatives: ['rojo', 'verde', 'morado']
  },
  // Números
  {
    word: 'uno',
    image: '/images/numbers/one.png',
    category: 'numbers',
    difficulty: 'easy',
    alternatives: ['dos', 'tres', 'cero']
  },
  {
    word: 'dos',
    image: '/images/numbers/two.png',
    category: 'numbers',
    difficulty: 'easy',
    alternatives: ['uno', 'tres', 'cuatro']
  },
  // Emociones
  {
    word: 'feliz',
    image: '/images/emotions/happy.png',
    category: 'emotions',
    difficulty: 'easy',
    alternatives: ['triste', 'enojado', 'sorprendido']
  },
  {
    word: 'triste',
    image: '/images/emotions/sad.png',
    category: 'emotions',
    difficulty: 'easy',
    alternatives: ['feliz', 'enojado', 'asustado']
  }
];

// Clase para manejar la lógica del juego
export class GameManager {
  private currentRound = 1;
  private maxRounds = 10;
  private currentTurn: 'slp' | 'child' = 'slp';
  private score = { slp: 0, child: 0 };
  private usedWords: string[] = [];
  private gameWords: GameWord[];

  constructor(words: GameWord[] = gameWords) {
    this.gameWords = words;
  }

  // Obtener palabra aleatoria para la ronda actual
  getRandomWord(): GameWord {
    const availableWords = this.gameWords.filter(word => 
      !this.usedWords.includes(word.word)
    );

    if (availableWords.length === 0) {
      // Si se acabaron las palabras, reiniciar
      this.usedWords = [];
      return this.gameWords[Math.floor(Math.random() * this.gameWords.length)];
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.usedWords.push(randomWord.word);
    return randomWord;
  }

  // Generar opciones para una palabra
  generateOptions(correctWord: GameWord): string[] {
    const options = [correctWord.word];
    
    // Agregar alternativas de la palabra correcta
    options.push(...correctWord.alternatives.slice(0, 2));
    
    // Agregar palabras aleatorias de otras categorías
    const otherWords = this.gameWords
      .filter(word => word.word !== correctWord.word && !correctWord.alternatives.includes(word.word))
      .map(word => word.word);
    
    const randomWords = this.shuffleArray(otherWords).slice(0, 1);
    options.push(...randomWords);
    
    return this.shuffleArray(options);
  }

  // Mezclar array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Procesar respuesta
  processAnswer(answer: string, correctAnswer: string, playerRole: 'slp' | 'child'): {
    isCorrect: boolean;
    points: number;
    newScore: { slp: number; child: number };
  } {
    const isCorrect = answer === correctAnswer;
    const points = isCorrect ? 10 : 0;
    
    if (isCorrect) {
      if (playerRole === 'slp') {
        this.score.slp += points;
      } else {
        this.score.child += points;
      }
    }

    return {
      isCorrect,
      points,
      newScore: { ...this.score }
    };
  }

  // Cambiar turno
  changeTurn(): 'slp' | 'child' {
    this.currentTurn = this.currentTurn === 'slp' ? 'child' : 'slp';
    return this.currentTurn;
  }

  // Avanzar ronda
  nextRound(): boolean {
    this.currentRound++;
    return this.currentRound <= this.maxRounds;
  }

  // Obtener estado del juego
  getGameState() {
    return {
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      currentTurn: this.currentTurn,
      score: { ...this.score },
      isGameOver: this.currentRound > this.maxRounds
    };
  }

  // Reiniciar juego
  resetGame() {
    this.currentRound = 1;
    this.currentTurn = 'slp';
    this.score = { slp: 0, child: 0 };
    this.usedWords = [];
  }

  // Obtener ganador
  getWinner(): 'slp' | 'child' | 'tie' {
    if (this.score.slp > this.score.child) return 'slp';
    if (this.score.child > this.score.slp) return 'child';
    return 'tie';
  }

  // Generar datos para una nueva ronda
  generateRoundData(): {
    word: string;
    image: string;
    options: string[];
    correctAnswer: string;
  } {
    const wordData = this.getRandomWord();
    const options = this.generateOptions(wordData);
    
    return {
      word: wordData.word,
      image: wordData.image,
      options,
      correctAnswer: wordData.word
    };
  }
}
