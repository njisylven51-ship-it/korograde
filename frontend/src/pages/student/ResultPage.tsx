import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../services/api';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Award, 
  Sparkles, 
  FileText, 
  Calendar, 
  Clock,
  ChevronRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface CorrectionItem {
  questionText: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface SubmissionDetail {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  corrections?: CorrectionItem[];
}

export const ResultPage: React.FC = () => {
  const { resultId } = useParams();
  const location = useLocation();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read stashed navigation state (if redirected directly from submit)
  const fromExamSubmit = location.state?.fromExamSubmit;
  const wasForcedByTimer = location.state?.wasForcedByTimer;

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const resp = await api.get(`/api/student/results/${resultId}`);
        setSubmission(resp.data);
      } catch (err: any) {
        console.error('Failed to load student result:', err);
        setError('Error retrieving performance sheet. Access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [resultId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-24">
          <div className="w-10 h-10 border-4 border-blue-605 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs text-slate-500 font-medium">Auto-grading answers sheet...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-4 max-w-sm mx-auto text-center shadow-md">
          <p className="font-bold text-rose-800">⚠️ Error Loading Performance sheet</p>
          <p className="text-xs text-rose-605 leading-normal">{error || 'Record coordinates missing.'}</p>
          <Link to="/student/results" className="inline-block px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold select-none transition">
            Back to Results
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const passed = submission.percentage >= 50;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        
        {/* Navigation line */}
        <div className="flex justify-between items-center bg-transparent select-none">
          <Link
            to="/student/results"
            className="flex items-center gap-1 px-3.5 py-1.5 border border-slate-205 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-650 transition shadow-xxs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Catalog
          </Link>
          <span className="text-[10px] text-slate-400 font-mono">Submission ID: {submission.id}</span>
        </div>

        {/* Success / Timer expiry congratulations banner */}
        {fromExamSubmit && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-750 p-6 rounded-2xl text-white shadow-md flex items-center justify-between border border-blue-700">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-widest font-mono text-blue-150">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
                {wasForcedByTimer ? 'Forced Time Submission Complete' : 'Grading assessment completed!'}
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                {wasForcedByTimer ? 'Timer expired, paper stashed!' : 'Your Answers Sheet Has Been Graded!'}
              </h2>
              <p className="text-xs text-blue-150 max-w-md">
                Automatic grading calculated correct answers against template guides. View correction traces below.
              </p>
            </div>
            <Award className="h-14 w-14 text-amber-300 hidden md:block shrink-0 animate-bounce" />
          </div>
        )}

        {/* Overview Stats banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {passed ? 'Assessed Passed (Pass >= 50%)' : 'Assessed Unsatisfactory'}
              </span>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-905 leading-tight">{submission.examTitle}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-180">
                <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-805">Evaluated Status</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">MCQ Auto-Calculated Grading</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-180">
                <Calendar className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-805">Completed On</p>
                  <p className="text-[10px] text-slate-400 font-normal font-mono mt-0.5">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scores Wheel */}
          <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-1 select-none">
            <div className={`p-2.5 rounded-full ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <TrendingUp className="h-7 w-7" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{submission.percentage}%</p>
            <p className="text-xs font-semibold text-slate-550">My Grade Score</p>
            <p className="text-[10px] text-slate-455 font-mono">({submission.score} Correct of {submission.totalQuestions})</p>
          </div>
        </div>

        {/* Detailed Correction reviews */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-xs font-bold text-slate-805 uppercase tracking-widest font-mono border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <HelpCircle className="h-4.5 w-4.5 text-slate-400" />
            MCQ Questions Correction Guides
          </h3>

          {!submission.corrections || submission.corrections.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs">No traces returned.</p>
          ) : (
            <div className="space-y-5">
              {submission.corrections.map((corr, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex gap-4 ${
                    corr.isCorrect ? 'bg-emerald-50/30 border-emerald-150' : 'bg-rose-50/20 border-rose-150'
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {corr.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600" />
                    )}
                  </span>

                  <div className="space-y-2.5 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-850">
                      Q{idx + 1}: <span className="font-semibold text-slate-705 leading-relaxed">{corr.questionText}</span>
                    </p>

                    {/* Choices details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                        const isChosen = corr.selectedOption === letter;
                        const isCorrect = corr.correctAnswer === letter;

                        let borderStyle = 'border-slate-200 bg-white';
                        if (isChosen) borderStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                        if (isCorrect) borderStyle = 'border-emerald-450 bg-emerald-50 text-emerald-950 font-extrabold';

                        return (
                          <div key={letter} className={`p-2 rounded-lg border flex items-center gap-2 ${borderStyle}`}>
                            <span className="font-bold font-mono">{letter}:</span>
                            <span className="truncate">{corr.options[letter]}</span>
                            {isChosen && <span className="text-[9px] font-mono font-bold uppercase text-rose-700 ml-auto">my answer</span>}
                            {isCorrect && <span className="text-[9px] font-mono font-bold uppercase text-emerald-700 ml-auto font-extrabold">correct option</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};
export default ResultPage;
