import React from 'react';
import { Trophy } from 'lucide-react';

interface GameScoreProps {
  score: {
    slp: number;
    child: number;
  };
}

const GameScore: React.FC<GameScoreProps> = ({ score }) => {
  const totalScore = score.slp + score.child;
  const slpPercentage = totalScore > 0 ? Math.round((score.slp / totalScore) * 100) : 0;
  const childPercentage = totalScore > 0 ? Math.round((score.child / totalScore) * 100) : 0;

  return (
    <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
      <Trophy className="w-5 h-5 text-yellow-300" />
      
      <div className="flex items-center space-x-3">
        {/* Puntuación del SLP */}
        <div className="text-center">
          <div className="text-sm font-medium text-blue-100">Terapeuta</div>
          <div className="text-xl font-bold text-blue-200">{score.slp}</div>
          {totalScore > 0 && (
            <div className="text-xs text-blue-100">{slpPercentage}%</div>
          )}
        </div>

        {/* Separador */}
        <div className="text-white font-bold text-lg">-</div>

        {/* Puntuación del Niño */}
        <div className="text-center">
          <div className="text-sm font-medium text-green-100">Niño</div>
          <div className="text-xl font-bold text-green-200">{score.child}</div>
          {totalScore > 0 && (
            <div className="text-xs text-green-100">{childPercentage}%</div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className="text-center border-l border-white/30 pl-3">
        <div className="text-sm font-medium text-white">Total</div>
        <div className="text-lg font-bold text-yellow-300">{totalScore}</div>
      </div>
    </div>
  );
};

export default GameScore;
