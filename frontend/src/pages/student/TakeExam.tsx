import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle, 
  ShieldAlert,
  Loader2,
  HelpCircle,
  Award
} from 'lucide-react';

interface QuestionDetails {
  id: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface ExamTakeDetails {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  submissionId: string | null;
  questions: QuestionDetails[];
}

export const TakeExam: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState<ExamTakeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answers stashing state: Map of questionId -> selectedOption ('A'|'B'|'C'|'D'|'')
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | ''>>({});

  // Active indices for bento/slider MCQ questions
  const [currentIndex, setCurrentIndex] = useState(0);

  // Active counting down states: seconds left
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const resp = await api.get(`/api/student/exams/${examId}`);
        const data = resp.data as ExamTakeDetails;

        if (data.completed) {
          setError('You have already completed this exam. Multiple attempts are not allowed.');
          setLoading(false);
          return;
        }

        setExam(data);
        setTimeLeft(data.duration * 60); // In seconds
        
        // Initialize blank records for questions
        const initialAnswers: Record<string, 'A' | 'B' | 'C' | 'D' | ''> = {};
        data.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (err: any) {
        console.error('Failed to load exam instance:', err);
        setError('Error establishing exam gateway. Please check connections.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Countdown clock active triggers
  useEffect(() => {
    if (loading || error || isSubmitting || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit!
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, error, isSubmitting, timeLeft]);

  const handleSelectOption = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAutoSubmit = () => {
    console.log('⏳ Countdown timer hit zero. Executing automated forced submission...');
    executeSubmission(true);
  };

  const executeSubmission = async (isForcedByTimer = false) => {
    if (!exam || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    // Formulate final payload answers
    const payloadAnswers = Object.entries(answers).map(([qId, ans]) => ({
      questionId: qId,
      selectedOption: ans
    }));

    try {
      const resp = await api.post('/api/student/submit', {
        examId: exam.id,
        answers: payloadAnswers
      });

      const resultId = resp.data.result.submissionId;
      navigate(`/student/results/details/${resultId}`, { 
        state: { 
          fromExamSubmit: true,
          wasForcedByTimer: isForcedByTimer 
        }, 
        replace: true 
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Forced submission pipeline failed. Please report to teacher.');
      setIsSubmitting(false);
    }
  };

  const handleSubmitClaw = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if some questions missed
    const unansweredCount = Object.values(answers).filter(a => a === '').length;
    let confirmPrompt = 'Are you sure you choose to finish and submit your exam paper now?';
    if (unansweredCount > 0) {
      confirmPrompt = `⚠️ Warning: You have left ${unansweredCount} questions blank! If you submit now, they will be marked INCORRECT. Proceed anyway?`;
    }

    if (window.confirm(confirmPrompt)) {
      executeSubmission(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 border-blue-500 text-blue-500 animate-spin" />
        <p className="mt-4 text-xs tracking-widest text-slate-400 font-mono">ENCRYPTING EXAM KEYSETS...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-205 shadow-xl text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto animate-pulse" />
          <h3 className="text-md font-bold text-slate-905">Secure Lock Blocked</h3>
          <p className="text-xs text-slate-505 leading-relaxed">
            {error || 'This exam instance is inaccessible.'}
          </p>
          <button
            onClick={() => navigate('/student/exams')}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg transition"
          >
            Re-enter Catalog
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIndex];
  const totalQuestions = exam.questions.length;
  const answeredCount = Object.values(answers).filter(a => a !== '').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Strict Top Status Bar with active running clock */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow border-b border-slate-950 select-none">
        <div className="min-w-0 flex-1 mr-4">
          <h1 className="text-sm font-bold truncate tracking-tight text-white">{exam.title}</h1>
          <p className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">Cand: {user?.name} ({user?.email})</p>
        </div>

        {/* Dynamic timer box */}
        <div className={`
          flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold font-extrabold text-sm shrink-0
          ${timeLeft <= 60 
            ? 'bg-rose-950/40 border-rose-500 text-rose-400 animate-pulse' 
            : 'bg-slate-950/50 border-slate-700 text-emerald-400'}
        `}>
          <Clock className="h-4.5 w-4.5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Core Form Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left pane: Active Question Board */}
        <section className="col-span-1 lg:col-span-3 space-y-5">
          {/* Question text */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-100 pb-3 font-mono text-xxs font-bold">
              <span>MCQ QUESTION {currentIndex + 1} OF {totalQuestions}</span>
              <span className="text-blue-600 uppercase">Single Answer choice</span>
            </div>

            <p className="text-sm md:text-base font-bold text-slate-805 leading-relaxed">
              {currentQuestion?.questionText}
            </p>
          </div>

          {/* Choices container list */}
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
              const optionText = currentQuestion?.options[letter];
              const isSelected = answers[currentQuestion.id] === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, letter)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border text-left text-xs font-medium cursor-pointer transition-all duration-150 select-none
                    ${isSelected 
                      ? 'bg-blue-50/50 border-blue-600 text-blue-900 ring-2 ring-blue-600/10 font-bold shadow-xxs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}
                  `}
                >
                  <span className={`
                    w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 border transition-all duration-150
                    ${isSelected 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-slate-50 border-slate-205 text-slate-500'}
                  `}>
                    {letter}
                  </span>
                  <span className="leading-snug flex-1 truncate">{optionText}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom control row */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2 text-xs border border-slate-205 bg-white hover:bg-slate-50 text-slate-650 font-bold rounded-lg transition disabled:opacity-40"
            >
              Previous Question
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2 text-xs bg-slate-805 hover:bg-slate-950 text-white font-bold rounded-lg transition"
              >
                Next Question
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitClaw}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-5 py-2 bg-blue-650 hover:bg-blue-750 text-white text-xs font-bold rounded-lg transition shadow-md select-none"
              >
                <Send className="h-4 w-4 shrink-0" />
                Submit Exam Paper
              </button>
            )}
          </div>
        </section>

        {/* Right pane: Grid navigation map */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 self-start select-none">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-805">Questions Index Map</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">{answeredCount} of {totalQuestions} answered</p>
          </div>

          {/* Grid buttons map */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2">
            {exam.questions.map((q, qidx) => {
              const answered = answers[q.id] !== '';
              const isActive = qidx === currentIndex;

              let dotStyle = 'bg-white border-slate-205 text-slate-600';
              if (answered) dotStyle = 'bg-slate-100 border-slate-350 text-slate-800 font-bold';
              if (isActive) dotStyle = 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-100 shadow-xxs';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(qidx)}
                  className={`
                    w-9 h-9 text-xs rounded-lg border font-semibold flex items-center justify-center transition-all duration-150
                    ${dotStyle}
                  `}
                >
                  {qidx + 1}
                </button>
              );
            })}
          </div>

          {/* Quick instructions box inside Take exam */}
          <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg space-y-1">
            <p className="text-[10px] font-bold text-rose-800 flex items-center gap-1 leading-normal uppercase">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
              Do not refresh
            </p>
            <p className="text-[9px] text-rose-800/80 leading-relaxed font-semibold">
              Refreshing will dump stashed state. Automatic grading online.
            </p>
          </div>
        </section>

      </main>

      {/* Empty Footer spacing wrapper */}
      <footer className="h-4"></footer>
    </div>
  );
};
export default TakeExam;
