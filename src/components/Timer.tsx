import { Clock } from 'lucide-react';
import { useEffect } from 'react';

interface TimerProps {
  isRunning: boolean;
  seconds: number;
  onTimeUpdate?: (seconds: number) => void;
}

export default function Timer({ isRunning, seconds, onTimeUpdate }: TimerProps) {
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (onTimeUpdate) {
        onTimeUpdate(seconds + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="font-mono text-lg font-semibold text-gray-800">
        {formatTime(seconds)}
      </span>
    </div>
  );
}