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

type QuizState = 'user-details' | 'welcome' | 'countdown' | 'quiz' | 'boss-transition' | 'results';

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

  const hasRequiredParams = () => {
    const params = getUrlParams();
    const isCourseAllowed = ALLOWED_COURSE_IDS.includes(params.course_id);
    const isWeekAllowed = ALLOWED_WEEKS.includes(params.week);
    return params.name && params.email && isCourseAllowed && isWeekAllowed;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentPhase = currentQuestion?.difficulty === 'boss' ? 'boss' : 'standard';

  const checkQuizStatus = async (courseId: string, week: string): Promise<boolean> => {
    console.log('🔍 Checking quiz status for:', { courseId, week });
    
    try {
      // First, let's see all records in the table for debugging
      const { data: allData, error: allError } = await supabase
        .from('quiz_status')
        .select('*');
      
      console.log('📊 All quiz statuses in database:', allData);
      
      // Now check for the specific quiz
      const { data, error } = await supabase
        .from('quiz_status')
        .select('*')
        .eq('course_id', courseId)
        .eq('week', week)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

      console.log('🔍 Query result:', { data, error });

      if (!data) {
        console.log('⚠️ No quiz_status record found for course_id:', courseId, 'week:', week);
        console.log('💡 To fix this, run this SQL in Supabase:');
        console.log(`INSERT INTO quiz_status (course_id, week, is_active) VALUES ('${courseId}', '${week}', true);`);
        return false;
      }

      console.log('✅ Quiz status found:', data);
      return data.is_active === true;
    } catch (err) {
      console.error('❌ Error in checkQuizStatus:', err);
      return false;
    }
  };

  const loadQuestions = async (courseId: string, week: string) => {
    try {
      console.log('📚 Loading questions for course:', courseId, 'week:', week);
      
      const { data, error: fetchError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('course_id', courseId)
        .eq('week', week)
        .order('order_number', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching questions:', fetchError);
        throw fetchError;
      }

      console.log('📚 Questions loaded:', data?.length || 0, 'questions');

      if (!data || data.length === 0) {
        throw new Error('No questions found for this course and week');
      }

      setQuestions(data as QuizQuestion[]);
      return true;
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load quiz questions. Please try again later.');
      return false;
    }
  };

  useEffect(() => {
    const initializeQuiz = async () => {
      console.log('🚀 Starting quiz initialization...');
      const params = getUrlParams();
      console.log('🔗 URL parameters:', params);
      
      // Validate required parameters
      if (!params.course_id || !params.week) {
        setError('Missing course_id or week in URL');
        setLoading(false);
        return;
      }

      if (!params.name || !params.email) {
        setError('Missing name or email in URL');
        setLoading(false);
        return;
      }

      // Check if course and week are allowed
      if (!ALLOWED_COURSE_IDS.includes(params.course_id)) {
        setError(`Course ID ${params.course_id} is not allowed. Allowed courses: ${ALLOWED_COURSE_IDS.join(', ')}`);
        setLoading(false);
        return;
      }

      if (!ALLOWED_WEEKS.includes(params.week)) {
        setError(`Week ${params.week} is not allowed. Allowed weeks: ${ALLOWED_WEEKS.join(', ')}`);
        setLoading(false);
        return;
      }

      try {
        // Check if quiz is active
        const isActive = await checkQuizStatus(params.course_id, params.week);
        
        if (!isActive) {
          setError(`This quiz (Course ${params.course_id}, Week ${params.week}) is currently inactive. Please contact your administrator.`);
          setLoading(false);
          return;
        }

        console.log('✅ Quiz is active, loading questions...');

        // Set user details
        setUserDetails({
          name: params.name,
          email: params.email,
          mobile: '',
          college: '',
          course_id: params.course_id,
          week: params.week
        });
        
        // Load questions
        const questionsLoaded = await loadQuestions(params.course_id, params.week);
        
        if (questionsLoaded) {
          console.log('✅ Everything loaded successfully!');
          setQuizState('user-details');
        }
      } catch (err) {
        console.error('❌ Error during initialization:', err);
        setError('Failed to initialize quiz. Please try again.');
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

  if (error) {
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
          {error.includes('inactive') && params.course_id && params.week && (
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-left">
              <p className="font-medium">For Administrator:</p>
              <p className="text-sm mt-1">To activate this quiz, run this SQL query in Supabase:</p>
              <code className="block bg-gray-100 p-2 rounded text-xs mt-2 text-gray-800 break-all">
                INSERT INTO quiz_status (course_id, week, is_active) VALUES ('{params.course_id}', '{params.week}', true) ON CONFLICT (course_id, week) DO UPDATE SET is_active = true, updated_at = NOW();
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