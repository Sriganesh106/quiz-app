import { useEffect, useState, useRef } from 'react';
import { Flame, Zap, Target } from 'lucide-react';

interface BossTransitionProps {
  onComplete: () => void;
}

export default function BossTransition({ onComplete }: BossTransitionProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log('BossTransition mounted, starting timers');
    
    const enterTimer = setTimeout(() => {
      console.log('Phase: show');
      setPhase('show');
    }, 300);

    const showTimer = setTimeout(() => {
      console.log('Phase: exit');
      setPhase('exit');
    }, 3000);

    const exitTimer = setTimeout(() => {
      console.log('BossTransition calling onComplete');
      onCompleteRef.current();
    }, 3800);

    return () => {
      console.log('BossTransition cleanup');
      clearTimeout(enterTimer);
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          phase === 'enter'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-red-900 via-red-800 to-orange-900'
        }`}
      >
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `twinkle ${1 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className={`relative z-10 text-center transition-all duration-700 ${
          phase === 'enter'
            ? 'opacity-0 scale-50'
            : phase === 'show'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-150'
        }`}
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl bg-red-500 opacity-50 animate-pulse"></div>

          <div className="relative flex justify-center items-center gap-4 mb-6">
            <Flame className="w-16 h-16 text-orange-400 animate-bounce" />
            <Zap className="w-20 h-20 text-yellow-300" style={{ animation: 'spin 2s linear infinite' }} />
            <Flame className="w-16 h-16 text-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>

          <div
            className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 mb-4"
            style={{
              textShadow: '0 0 40px rgba(251, 146, 60, 0.8)',
              animation: 'glow 1.5s ease-in-out infinite',
            }}
          >
            FINAL BOSS
          </div>

          <div className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ animation: 'slideUp 0.8s ease-out 0.3s both' }}>
            ROUND
          </div>

          <div className="flex items-center justify-center gap-3 px-8 py-4 bg-red-500/20 backdrop-blur-sm rounded-2xl border-2 border-red-400/50 mx-auto w-fit">
            <Target className="w-8 h-8 text-red-300" />
            <p className="text-2xl md:text-3xl font-bold text-red-100">
              Choose the INCORRECT Answer!
            </p>
            <Target className="w-8 h-8 text-red-300" />
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-orange-400"
              style={{
                animation: `pulse 1s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 20px rgba(251, 146, 60, 0.6));
          }
          50% {
            filter: brightness(1.3) drop-shadow(0 0 40px rgba(251, 146, 60, 0.9));
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}