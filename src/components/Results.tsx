import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Calculate results
  const totalQuestions = questions.length;
  const correctAnswers = userAnswers.filter(
    (answer, index) => answer === questions[index].correct_answer
  ).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const submitResults = async () => {
    if (!userDetails.name || !userDetails.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('submit_quiz_with_details', {
        p_user_name: userDetails.name,
        p_email: userDetails.email,
        p_mobile_number: userDetails.phone || '',
        p_college_name: userDetails.college || '',
        p_total_questions: totalQuestions,
        p_correct_answers: correctAnswers,
        p_time_taken_seconds: timeSpent,
        p_answers: userAnswers,
        p_course_id: 'default',
        p_week: '1'
      });

      if (error) {
        console.error('Error saving quiz results:', error);
        setError('Failed to save results. Please try again.');
        return;
      }

      console.log('Quiz results saved successfully:', data);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error in submitResults:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const submitOnMount = async () => {
      await submitResults();
    };
    submitOnMount();
  }, []);

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Saving your results...</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Quiz Results</h1>
            <p className="text-center text-gray-600 mb-8">Here's how you performed on the quiz</p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Your Score</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {correctAnswers}<span className="text-gray-500">/{totalQuestions}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ({scorePercentage}% {scorePercentage >= 70 ? '🎉' : '👍'})
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Correct</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{correctAnswers}</p>
                <p className="text-sm text-gray-500 mt-1">Well done!</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Time Spent</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </p>
                <p className="text-sm text-gray-500 mt-1">minutes:seconds</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Question Review</h2>
              <div className="space-y-6">
                {questions.map((question, index) => {
                  const isCorrect = userAnswers[index] === question.correct_answer;
                  const userAnswer = userAnswers[index] || 'Not answered';
                  const correctAnswer = question.correct_answer;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${
                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            Q{index + 1}: {question.question_text}
                          </p>
                          <div className="mt-2">
                            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              <span className="font-medium">Your answer:</span> {userAnswer}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-700 mt-1">
                                <span className="font-medium">Correct answer:</span> {correctAnswer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
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
        </div>
      </div>
    </div>
  );
};

export default Results;