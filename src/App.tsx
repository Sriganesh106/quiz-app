import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Countdown from './components/Countdown';
import BossTransition from './components/BossTransition';
import ProgressLine from './components/ProgressLine';
import QuestionCard, { QuizQuestion } from './components/QuestionCard';
import Timer from './components/Timer';
import Results from './components/Results';
import UserDetailsForm from './components/UserDetailsForm';
import { supabase } from './lib/supabase';

const ALLOWED_COURSE_IDS = ['3', '4', '7', '8'];
const ALLOWED_WEEKS = ['1', '2', '3'];

type QuizState = 'user-details' | 'welcome' | 'countdown' | 'quiz' | 'boss-transition' | 'results' | 'error';

interface UserDetails {
  name: string;
  email: string;
  mobile: string;
  college: string;
  course_id?: string;
  week?: string;
}

interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

function App() {
  const [quizState, setQuizState] = useState<QuizState>('user-details');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasRecordedParticipantRef = useRef(false);
  const hasSubmittedResults = useRef(false);

  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      name: urlParams.get('name')?.trim() || '',
      email: urlParams.get('email')?.trim() || '',
      course_id: urlParams.get('course_id')?.trim() || '',
      week: urlParams.get('week')?.trim() || '',
    };
  };

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const initializeQuiz = async () => {
      console.log('🚀 Starting quiz initialization...');
      const params = getUrlParams();
      console.log('🔗 URL parameters:', params);
      
      try {
        // Validate required parameters
        if (!params.course_id || !params.week || !params.name || !params.email) {
          throw new Error('Missing required parameters in URL');
        }

        // Check if course and week are allowed
        if (!ALLOWED_COURSE_IDS.includes(params.course_id) || !ALLOWED_WEEKS.includes(params.week)) {
          throw new Error(`Invalid course (${params.course_id}) or week (${params.week})`);
        }

        // Check quiz status
        console.log('🔍 Checking quiz status...');
        const { data: statusData, error: statusError } = await supabase
          .from('quiz_status')
          .select('*')
          .eq('course_id', params.course_id)
          .eq('week', params.week)
          .maybeSingle();

        console.log('📊 Status query result:', { statusData, statusError });

        if (statusError) {
          throw new Error('Failed to check quiz status');
        }

        // Check if quiz exists and is active
        if (!statusData) {
          throw new Error(`Quiz not found for Course ${params.course_id}, Week ${params.week}`);
        }

        if (!statusData.is_active) {
          throw new Error(`This quiz (Course ${params.course_id}, Week ${params.week}) is currently inactive. Please contact your administrator.`);
        }

        console.log('✅ Quiz is active, loading questions...');

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('course_id', params.course_id)
          .eq('week', params.week)
          .order('order_number', { ascending: true });

        if (questionsError) {
          throw new Error('Failed to load quiz questions');
        }

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found for this quiz');
        }

        console.log('✅ Questions loaded:', questionsData.length);

        // Set state
        setQuestions(questionsData as QuizQuestion[]);
        setUserDetails({
          name: params.name,
          email: params.email,
          mobile: '',
          college: '',
          course_id: params.course_id,
          week: params.week
        });
        setQuizState('user-details');
        setError(null);

      } catch (err: any) {
        console.error('❌ Initialization error:', err);
        setError(err.message || 'Failed to initialize quiz');
        setQuizState('error');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, []);

  const handleUserDetailsSubmit = async (details: { mobile: string; college: string }) => {
    if (!userDetails) return;

    const updatedDetails = {
      ...userDetails,
      mobile: details.mobile,
      college: details.college,
    };

    setUserDetails(updatedDetails);
    setQuizState('welcome');
  };

  const handleStartQuiz = () => {
    setQuizState('countdown');
  };

  const handleCountdownComplete = () => {
    setQuizState('quiz');
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;

    const isCorrect = answer === currentQuestion.correct_answer;
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: answer,
      correctAnswer: currentQuestion.correct_answer,
      isCorrect,
    };

    setAnswers([...answers, newAnswer]);

    if (currentQuestionIndex === questions.length - 1) {
      setQuizState('results');
      recordQuizCompletion();
    } else if (currentQuestion.difficulty === 'boss' && currentQuestionIndex < questions.length - 1) {
      setQuizState('boss-transition');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBossTransitionComplete = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setQuizState('quiz');
  };

  const recordQuizCompletion = async () => {
    if (!userDetails || hasSubmittedResults.current) return;
    hasSubmittedResults.current = true;

    const score = answers.filter(a => a.isCorrect).length;
    const total = questions.length;

    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert([{
          name: userDetails.name,
          email: userDetails.email,
          mobile: userDetails.mobile,
          college: userDetails.college,
          course_id: userDetails.course_id,
          week: userDetails.week,
          score,
          total_questions: total,
          time_taken: Math.round(timeTaken / 1000),
          answers: answers.map(a => ({
            question_id: a.questionId,
            user_answer: a.userAnswer,
            is_correct: a.isCorrect
          }))
        }]);

      if (error) throw error;
      console.log('✅ Quiz results saved successfully');
    } catch (err) {
      console.error('Error saving quiz results:', err);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeTaken(0);
    hasSubmittedResults.current = false;
    setQuizState('welcome');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Checking quiz status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || quizState === 'error') {
    const params = getUrlParams();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {error?.includes('inactive') && params.course_id && params.week && (
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-left">
              <p className="font-medium">For Administrator:</p>
              <p className="text-sm mt-1">To activate this quiz, run this SQL query in Supabase:</p>
              <code className="block bg-gray-100 p-2 rounded text-xs mt-2 text-gray-800 break-all">
                UPDATE quiz_status SET is_active = true, updated_at = NOW() WHERE course_id = '{params.course_id}' AND week = '{params.week}';
              </code>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Rest of your component remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      {quizState === 'user-details' && userDetails && (
        <UserDetailsForm
          onSubmit={handleUserDetailsSubmit}
          initialValues={{
            mobile: userDetails.mobile || '',
            college: userDetails.college || ''
          }}
        />
      )}

      {quizState === 'welcome' && userDetails && (
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to the Quiz, {userDetails.name}!
            </h1>
            <p className="text-gray-600 mb-8">
              You're about to take the quiz for Course {userDetails.course_id}, Week {userDetails.week}.
              Make sure you're ready before starting.
            </p>
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
            >
              <Sparkles className="mr-2" size={20} />
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {quizState === 'countdown' && (
        <Countdown onComplete={handleCountdownComplete} />
      )}

      {quizState === 'quiz' && currentQuestion && (
        <div className="max-w-3xl mx-auto p-4">
          <ProgressLine
            current={currentQuestionIndex + 1}
            total={questions.length}
            isBoss={currentQuestion.difficulty === 'boss'}
          />
          <Timer onTimeUpdate={setTimeTaken} running={quizState === 'quiz'} />
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {quizState === 'boss-transition' && (
        <BossTransition onComplete={handleBossTransitionComplete} />
      )}

      {quizState === 'results' && userDetails && (
        <Results
          answers={answers}
          questions={questions}
          timeTaken={timeTaken}
          onRestart={handleRestart}
          userDetails={userDetails}
        />
      )}
    </div>
  );
}

export default App;