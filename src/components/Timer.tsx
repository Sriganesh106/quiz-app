import { Clock } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export default function Timer({ isRunning, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const newTime = prev + 1;
        if (onTimeUpdate) {
          onTimeUpdate(newTime);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, onTimeUpdate]);

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