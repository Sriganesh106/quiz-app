import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';

interface ResultsProps {
  userAnswers: string[];
  questions: Array<{
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
  }>;
  timeSpent: number;
  onRestart: () => void;
  userDetails: {
    name: string;
    email: string;
    phone: string;
    college: string;
  };
}

const Results: React.FC<ResultsProps> = ({ 
  userAnswers, 
  questions, 
  timeSpent, 
  onRestart,
  userDetails 
}) => {
  const navigate = useNavigate();

  // Calculate results
  const totalQuestions = questions.length;
  const correctAnswers = userAnswers.filter(
    (answer, index) => answer === questions[index].correct_answer
  ).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  // ✅ REMOVED: All the submission logic - App.tsx already handles it

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Submitted!</h1>
          <p className="text-gray-600 mb-8">Your results have been saved successfully.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-semibold text-lg mb-1">Score</div>
              <div className="text-3xl font-bold">{correctAnswers}/{totalQuestions}</div>
              <div className="text-sm text-gray-500">{scorePercentage}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 font-semibold text-lg mb-1">Time Spent</div>
              <div className="text-2xl font-bold">
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </div>
              <div className="text-sm text-gray-500">minutes:seconds</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-amber-600 font-semibold text-lg mb-1">Performance</div>
              <div className="text-2xl font-bold">
                {scorePercentage >= 70 ? 'Great!' : scorePercentage >= 50 ? 'Good' : 'Needs Practice'}
              </div>
              <div className="text-sm text-gray-500">Keep it up!</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Take Quiz Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 

export default Results;