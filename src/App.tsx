import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import QuestionCard from './components/QuestionCard';
import Results from './components/Results';
import WelcomeScreen from './components/WelcomeScreen';
import Countdown from './components/Countdown';
import BossTransition from './components/BossTransition';
import ProgressLine from './components/ProgressLine';
import Timer from './components/Timer';

type QuizState = 'user-details' | 'welcome' | 'countdown' | 'quiz' | 'boss-transition' | 'results';

interface UserDetails {
  name: string;
  email: string;
  courseId: string;
  week: string;
}

interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeTaken: number;
}

const ALLOWED_COURSE_IDS = ['1', '2', '3', '4', '7', '8'];
const ALLOWED_WEEKS = ['1', '2', '3'];

function App() {
  const [quizState, setQuizState] = useState<QuizState>('user-details');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRecordedParticipantRef = useRef(false);
  const hasSubmittedResults = useRef(false);
  const timerStartTime = useRef<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load questions when component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const courseId = params.get('course_id');
        const week = params.get('week');

        if (!courseId || !week) {
          setError('Missing course_id or week parameter');
          setLoading(false);
          return;
        }

        if (!ALLOWED_COURSE_IDS.includes(courseId) || !ALLOWED_WEEKS.includes(week)) {
          setError('Invalid course or week');
          setLoading(false);
          return;
        }

        // Record participant access
        if (!hasRecordedParticipantRef.current) {
          const name = params.get('name') || 'Anonymous';
          const email = params.get('email') || 'unknown@example.com';
          
          await supabase
            .from('quiz_participants')
            .insert([{ name, email, course_id: courseId, week }]);

          hasRecordedParticipantRef.current = true;
          setUserDetails({ name, email, courseId, week });
        }

        // Load questions
        const { data, error: queryError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('course_id', courseId)
          .eq('week', week)
          .order('order_number', { ascending: true });

        if (queryError) throw queryError;

        if (!data || data.length === 0) {
          setError('No questions found for this course and week');
          setLoading(false);
          return;
        }

        setQuestions(data);
        setLoading(false);
        setQuizState('welcome');
      } catch (err) {
        console.error('Error loading questions:', err);
        setError('Failed to load questions. Please try again later.');
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (quizState === 'quiz' || quizState === 'boss-transition') {
      if (timerStartTime.current === null) {
        timerStartTime.current = Date.now();
      }
      
      const timer = setInterval(() => {
        if (timerStartTime.current) {
          const newElapsedTime = Math.floor((Date.now() - timerStartTime.current) / 1000);
          setElapsedTime(newElapsedTime);
          setTimeTaken(newElapsedTime);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quizState]);

  const handleStartQuiz = () => {
    setQuizState('countdown');
  };

  const handleCountdownComplete = () => {
    setQuizState('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (!questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const answerTime = elapsedTime;

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
      timeTaken: answerTime - timeTaken,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      setQuizState('results');
      return;
    }

    // Check if next question is a boss question
    const nextQuestion = questions[currentQuestionIndex + 1];
    if (nextQuestion?.difficulty === 'boss') {
      setQuizState('boss-transition');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const startBossRound = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setQuizState('quiz');
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setElapsedTime(0);
    setTimeTaken(0);
    timerStartTime.current = null;
    hasSubmittedResults.current = false;
    setQuizState('welcome');
  };

  const handleSubmitResults = async (finalScore: number) => {
    if (hasSubmittedResults.current || !userDetails) return;
    
    try {
      await supabase.from('quiz_results').insert([{
        name: userDetails.name,
        email: userDetails.email,
        course_id: userDetails.courseId,
        week: userDetails.week,
        score: finalScore,
        time_taken: timeTaken,
        total_questions: questions.length,
        correct_answers: answers.filter(a => a.isCorrect).length
      }]);
      
      hasSubmittedResults.current = true;
    } catch (err) {
      console.error('Error submitting results:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <div className="text-white text-xl">Loading quiz...</div>
          <p className="text-gray-400 text-sm mt-2">Preparing your questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-700 text-red-100 p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'user-details' || !userDetails) {
    return null; // This state is handled by the WelcomeScreen component
  }

  if (quizState === 'welcome') {
    return (
      <WelcomeScreen
        courseId={userDetails.courseId}
        week={userDetails.week}
        onStart={handleStartQuiz}
      />
    );
  }

  if (quizState === 'countdown') {
    return <Countdown onComplete={handleCountdownComplete} />;
  }

  if (quizState === 'boss-transition') {
    return <BossTransition onComplete={startBossRound} />;
  }

  if (quizState === 'quiz' && questions[currentQuestionIndex]) {
    const currentQuestion = questions[currentQuestionIndex];
    const isBossRound = currentQuestion.difficulty === 'boss';

    return (
      <div className={`min-h-screen py-8 px-4 transition-colors duration-700 ${
        isBossRound 
          ? 'bg-gradient-to-br from-red-900 via-red-800 to-orange-900' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold break-words text-center sm:text-left ${
              isBossRound ? 'text-white' : 'text-gray-900'
            }`}>
              {isBossRound ? 'Final Boss Round' : 'Standard Round'}
            </h1>
            <Timer 
              isRunning={quizState === 'quiz'} 
              elapsedTime={elapsedTime} 
              onTimeUpdate={setElapsedTime} 
            />
          </div>

          <ProgressLine
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            phase={isBossRound ? 'boss' : 'standard'}
          />

          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            isBossRound={isBossRound}
          />
        </div>
      </div>
    );
  }

  if (quizState === 'results' && userDetails) {
    return (
      <Results
        answers={answers}
        questions={questions}
        timeTaken={timeTaken}
        onRestart={handleRestart}
        userDetails={userDetails}
        onSubmitResults={handleSubmitResults}
      />
    );
  }

  return null;
}

export default App;