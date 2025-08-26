import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeRemaining: number;
  isActive: boolean;
  onTimeUp: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeRemaining, isActive, onTimeUp }) => {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!isActive || time <= 0) return;

    const interval = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, time, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (time > 30) return 'text-green-300';
    if (time > 10) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getProgressWidth = () => {
    const percentage = (time / timeRemaining) * 100;
    return `${Math.max(0, percentage)}%`;
  };

  return (
    <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
      <Clock className="w-5 h-5 text-white" />
      
      <div className="text-center">
        <div className="text-sm font-medium text-white">Tiempo</div>
        <div className={`text-xl font-bold ${getProgressColor()}`}>
          {formatTime(time)}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-20 h-2 bg-white/30 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            time > 30 ? 'bg-green-400' : time > 10 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: getProgressWidth() }}
        />
      </div>
    </div>
  );
};

export default GameTimer;
