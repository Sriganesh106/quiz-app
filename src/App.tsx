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
  const [loading, setLoading] = useState(false);
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

  const loadQuestions = async (courseId: string, week: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('course_id', courseId)
        .eq('week', week)
        .order('order_number', { ascending: true });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        throw new Error('No questions found for this course and week');
      }

      setQuestions(data as QuizQuestion[]);
      return true;
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load quiz questions. Invalid course or week specified.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const recordParticipantAccess = async () => {
      if (hasRecordedParticipantRef.current) return;
      const params = getUrlParams();

      if (!params.name || !params.email || !params.course_id || !params.week) {
        return;
      }

      try {
        console.log('Recording participant:', params);

        const { error } = await supabase
          .from('quiz_participants')
          .insert([{
            name: params.name,
            email: params.email,
            course_id: params.course_id,
            week: params.week,
            first_accessed: new Date().toISOString()
          }]);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Participant recorded successfully');
        hasRecordedParticipantRef.current = true;
      } catch (err) {
        console.error('Error recording participant access:', err);
      }
    };

    if (hasRequiredParams()) {
      const params = getUrlParams();
      setUserDetails({
        name: params.name,
        email: params.email,
        mobile: '',
        college: '',
        course_id: params.course_id,
        week: params.week
      });
      recordParticipantAccess();
      setQuizState('welcome');
    }
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

  const startQuiz = async () => {
    if (!userDetails?.course_id || !userDetails?.week) {
      setError('Course ID or Week is missing');
      return;
    }

    const success = await loadQuestions(userDetails.course_id, userDetails.week);
    if (success) {
      setQuizState('countdown');
    }
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

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      setQuizState('results');
      return;
    }

    const nextQuestion = questions[currentQuestionIndex + 1];
    if (currentQuestion.difficulty === 'standard' && nextQuestion?.difficulty === 'boss') {
      console.log('Transitioning to boss round');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuizState('boss-transition');
      return;
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const startBossRound = () => {
    console.log('Starting boss round at index:', currentQuestionIndex);
    setQuizState('quiz');
  };

  const handleTimeUpdate = (time: number) => {
    setTimeTaken(time);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeTaken(0);
    hasSubmittedResults.current = false;
    setQuizState('welcome');
  };

  if (quizState === 'user-details') {
    if (hasRequiredParams()) {
      return <UserDetailsForm onSubmit={handleUserDetailsSubmit} />;
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6">Quiz Challenge</h1>
          <p className="text-gray-300 mb-6">
            Please provide the required parameters in the URL:
            <br />
            name, email, course_id, and week
          </p>
          <div className="text-left bg-black/30 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-400 mb-2">Example URL:</p>
            <code className="text-xs bg-black/50 p-2 rounded block overflow-x-auto">
              ?name=John&email=john@example.com&course_id=3&week=1
            </code>
          </div>
          <p className="text-sm text-gray-400">
            Allowed course IDs: {ALLOWED_COURSE_IDS.join(', ')}<br />
            Allowed weeks: {ALLOWED_WEEKS.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  if (quizState === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div
          className="text-center max-w-2xl"
          style={{
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mb-6 shadow-2xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              Quiz Challenge
            </h1>
            {userDetails?.course_id && userDetails?.week && (
              <div className="mb-6">
                <p className="text-xl text-gray-300 mb-2">
                  Welcome, <span className="text-emerald-400 font-semibold">{userDetails.name}</span>!
                </p>
                <p className="text-lg text-gray-400">
                  Course {userDetails.course_id} • Week {userDetails.week}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-400/30">
                <div className="text-emerald-300 font-semibold mb-2">
                  Standard Round
                </div>
                <div className="text-white text-sm">
                  8 questions of normal difficulty to warm you up
                </div>
              </div>
              <div className="bg-red-500/20 rounded-xl p-4 border border-red-400/30">
                <div className="text-red-300 font-semibold mb-2">
                  Final Boss Round
                </div>
                <div className="text-white text-sm">
                  7 challenging questions to test your expertise
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xl font-bold py-5 px-12 rounded-2xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-2xl"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Start Quiz'}
          </button>

          <div className="mt-8 text-gray-400 text-sm">
            {questions.length} Questions • Timed Challenge • Track Your Progress
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  if (quizState === 'countdown') {
    return <Countdown onComplete={handleCountdownComplete} />;
  }

  if (quizState === 'boss-transition') {
    return <BossTransition onComplete={startBossRound} />;
  }

  if (quizState === 'quiz' && currentQuestion) {
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
            <Timer isRunning={true} onTimeUpdate={handleTimeUpdate} />
          </div>

          <ProgressLine
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            phase={currentPhase}
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

  if (quizState === 'results') {
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = questions.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    if (userDetails && !hasSubmittedResults.current) {
      hasSubmittedResults.current = true;
      
      const submitResults = async () => {
        try {
          console.log('Submitting quiz results...');
          
          const { data, error } = await supabase.rpc('submit_quiz_with_details', {
            p_user_name: userDetails.name,
            p_email: userDetails.email,
            p_mobile_number: userDetails.mobile || '',
            p_college_name: userDetails.college || '',
            p_course_id: userDetails.course_id || 'default',
            p_week: userDetails.week || '1',
            p_total_questions: totalQuestions,
            p_correct_answers: correctAnswers,
            p_time_taken_seconds: timeTaken,
            p_answers: answers
          });
          
          if (error) {
            console.error('Error details:', error);
            throw error;
          }
          
          console.log('Success:', data);
          return data;
        } catch (error) {
          console.error('Error in submitResults:', error);
          throw error;
        }
      };
      
      submitResults();
    }

    return (
      <Results
        correctAnswers={correctAnswers}
        totalQuestions={totalQuestions}
        timeTaken={timeTaken}
        onRestart={handleRestart}
        userEmail={userDetails?.email}
        userName={userDetails?.name}
        userMobile={userDetails?.mobile}
        userCollege={userDetails?.college}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <p className="text-red-800 text-center mb-4">{error}</p>
          <div className="text-left bg-red-100 p-4 rounded-lg mb-4">
            <p className="font-semibold mb-2">Required URL Parameters:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
              <li><code>name</code>: Student name</li>
              <li><code>email</code>: Student email</li>
              <li><code>course_id</code>: Must be one of {ALLOWED_COURSE_IDS.join(', ')}</li>
              <li><code>week</code>: Must be one of {ALLOWED_WEEKS.join(', ')}</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Example: <code>?name=John&email=test@example.com&course_id=3&week=1</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

export default App;